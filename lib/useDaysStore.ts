import { create } from 'zustand';
import { supabase } from './supabase';
import { checkAdjacentDays, createDay, uploadImage } from './supabase-functions';

export type DayData = {
  id: string;
  created_at: string;
  progress_json: {
    [key: string]: {
      generalScore?: number | null;
      bodyFatPercentage?: number | null;
      monthsNumber?: number | null;
      age?: number | null;
      explanation?: string;
      details?: any; // Add this field to store the full analysis
    };
  };
  fullbody?: string;
  back?: string;
  legs?: string;
  pic_fullbody?: string;
  pic_back?: string;
  pic_legs?: string;
};

type DaysStore = {
  currentDate: Date;
  dayData: DayData | null;
  dayId: string | null;
  hasPreviousDay: boolean;
  hasNextDay: boolean;
  recentDays: DayData[];
  loading: boolean;
  error: string | null;
  setCurrentDate: (date: Date) => void;
  fetchOrCreateDayData: (date: Date) => Promise<DayData | null>;
  handleDateChange: (direction: 'prev' | 'next') => Promise<void>;
  createTodayDay: () => Promise<void>;
  refreshCurrentDay: () => Promise<void>;
  uploadScanImage: (imageUri: string, type: 'fullbody' | 'face') => Promise<void>;
  updateDayProgress: (progressData: any) => Promise<void>;
};

type State = DaysStore;
type Actions = {
  set: (partial: Partial<State> | ((state: State) => Partial<State>)) => void;
  get: () => State;
};

export const useDaysStore = create<DaysStore>((set: Actions['set'], get: Actions['get']) => ({
  currentDate: new Date(),
  dayData: null,
  dayId: null,
  hasPreviousDay: false,
  hasNextDay: false,
  recentDays: [],
  loading: false,
  error: null,

  setCurrentDate: (date: Date) => set({ currentDate: date }),

  fetchOrCreateDayData: async (date: Date): Promise<DayData | null> => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const newDayData = await createDay(date, user.id);
        if (newDayData) {
          set({ dayData: newDayData, dayId: newDayData.id });
          return newDayData;
        } else {
          throw new Error('Failed to fetch or create day data');
        }
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  handleDateChange: async (direction: 'prev' | 'next') => {
    const { currentDate, recentDays, dayId } = get();
    const currentIndex = recentDays.findIndex((day: DayData) => day.id === dayId);
    let newIndex: number | undefined;

    if (direction === 'prev' && currentIndex < recentDays.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'next' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      await get().fetchOrCreateDayData(newDate);
      set({ currentDate: newDate });
      const { hasPreviousDay, hasNextDay } = await checkAdjacentDays(newDate);
      set({ hasPreviousDay, hasNextDay });
      return;
    }

    if (newIndex !== undefined) {
      const newDayData = recentDays[newIndex];
      set({
        currentDate: new Date(newDayData.created_at),
        dayData: newDayData,
        dayId: newDayData.id,
      });
      const { hasPreviousDay, hasNextDay } = await checkAdjacentDays(new Date(newDayData.created_at));
      set({ hasPreviousDay, hasNextDay });
    }
  },

  createTodayDay: async () => {
    const today = new Date();
    await get().fetchOrCreateDayData(today);
    const { hasPreviousDay, hasNextDay } = await checkAdjacentDays(today);
    set({ hasPreviousDay, hasNextDay });
  },

  refreshCurrentDay: async () => {
    const { currentDate } = get();
    await get().fetchOrCreateDayData(currentDate);
  },

  uploadScanImage: async (imageUri: string, type: 'fullbody' | 'face') => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { dayData, currentDate } = get();
      let currentDayData = dayData;

      // If no current day data, create a new day
      if (!currentDayData) {
        currentDayData = await createDay(currentDate, user.id);
        if (!currentDayData) throw new Error('Failed to create day data');
        set({ dayData: currentDayData, dayId: currentDayData.id });
      }

      // Upload image to storage
      const imagePath = await uploadImage(imageUri, type, user.id);
      if (!imagePath) throw new Error('Failed to upload image');

      // Update the day's progress_json with the new image path
      const updatedProgressJson = {
        ...currentDayData.progress_json,
        [type]: {
          ...currentDayData.progress_json[type],
          imagePath,
        },
      };

      // Update the day record in the database
      const { data, error: updateError } = await supabase
        .from('days')
        .update({ progress_json: updatedProgressJson })
        .eq('id', currentDayData.id)
        .single();

      if (updateError) throw updateError;

      // Update local state
      set({
        dayData: {
          ...currentDayData,
          progress_json: updatedProgressJson,
        },
      });

    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateDayProgress: async (progressData: any) => {
    const state = get();
    if (!state.dayId) {
      throw new Error('No day ID available');
    }

    try {
      // Merge with existing progress data
      const existingData = state.dayData?.progress_json || {};
      const mergedProgressData = {
        ...existingData,
        ...progressData
      };

      const { data, error } = await supabase
        .from('days')
        .update({ progress_json: mergedProgressData })
        .eq('id', state.dayId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Update local state
        set({ dayData: data });
        return data;
      }
    } catch (error) {
      console.error('Error updating day progress:', error);
      throw error;
    }
  },
}));
