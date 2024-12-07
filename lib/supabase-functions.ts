import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// Session Management
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return data.session;
}

// Day Data Management
export async function getDayId(date: Date) {
  const { data, error } = await supabase
    .from('days')
    .select('id, created_at')
    .eq('created_at', date.toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error getting dayId:', error);
    return null;
  }
  return data[0] || null;
}

export const checkDayExists = async (date: Date, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('days')
    .select('id')
    .eq('created_at', date.toISOString().split('T')[0])
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking day:', error);
    return false;
  }

  return !!data;
};

export const createDay = async (date: Date, userId: string) => {
  const dateString = date.toISOString().split('T')[0];
  
  // First, check if the day already exists
  const { data: existingDay, error: checkError } = await supabase
    .from('days')
    .select('*')
    .eq('created_at', dateString)
    .eq('user_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing day:', checkError);
    return null;
  }

  if (existingDay) {
    return existingDay;
  }

  // If the day doesn't exist, create a new one
  const { data: newDay, error: insertError } = await supabase
    .from('days')
    .insert({ created_at: dateString, user_id: userId })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating new day:', insertError);
    return null;
  }

  return newDay;
};

export async function hasDayData(date: Date) {
  const { data, error } = await supabase
    .from('days')
    .select('id')
    .eq('created_at', date.toISOString().split('T')[0])
    .limit(1);

  if (error) {
    console.error('Error checking day data:', error);
    return false;
  }

  return data.length > 0;
}

// Utility Functions
export const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const checkAdjacentDays = async (date: Date) => {
  try {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [hasPrev, hasNext] = await Promise.all([
      hasDayData(prevDate),
      hasDayData(nextDate)
    ]);

    return { hasPreviousDay: hasPrev, hasNextDay: hasNext };
  } catch (error) {
    console.error('Error checking adjacent days:', error);
    return { hasPreviousDay: false, hasNextDay: false };
  }
};

// Message Management
export async function uploadMessage({ content, role, user_id }: { content: string; role: 'user' | 'ai'; user_id: string }) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          role,
          user_id,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error uploading message:', error);
    }
  } catch (error) {
    console.error('Error in uploadMessage function:', error);
  }
}

export async function fetchMessages(userId: string, page: number, perPage: number) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * perPage, (page + 1) * perPage - 1);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map(msg => ({
    id: msg.id,
    text: msg.content,
    sender: msg.role,
    created_at: msg.created_at,
  }));
}

// Add these new functions

export async function uploadImage(userId: string, imageUri: string, scanType: string) {
  try {
    console.log('uploadImage called with:', { userId, imageUri, scanType });
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        
        // Generate the date string in dd_mm_yyyy format
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateString = `${day}_${month}_${year}`;
        
        const fileName = `pic_${scanType.toLowerCase()}_${dateString}.jpg`;
        const filePath = `${userId}/${fileName}`;

        console.log('Preparing to upload to Supabase storage...', { fileName, filePath });
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, decode(base64Data), {
            contentType: 'image/jpeg',
          });

        if (error) {
          console.error('Error uploading image to Supabase:', error);
          reject(error);
        } else {
          console.log('Image uploaded successfully, getting public URL...');
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          console.log('Public URL:', urlData.publicUrl);
          resolve(urlData.publicUrl);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}

export async function updateDayWithImage(date: string, scanType: string, imageUrl: string) {
  console.log('updateDayWithImage called with:', { date, scanType, imageUrl });
  const { data, error } = await supabase
    .from('days')
    .update({ [`pic_${scanType}`]: imageUrl })
    .eq('created_at', date)
    .select();

  if (error) {
    console.error('Error updating day with image:', error);
    throw error;
  }

  return data;
}

// Add this function to fetch day data
export async function getDayData(date: string, userId: string) {
  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('created_at', date)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching day data:', error);
    return null;
  }

  return data;
}

export async function prefetchRecentDays(userId: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const dates = [today, yesterday, twoDaysAgo].map(date => date.toISOString().split('T')[0]);

  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', userId)
    .in('created_at', dates)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error prefetching recent days:', error);
    return null;
  }

  // Create days that don't exist
  const existingDates = data.map(day => day.created_at);
  const missingDates = dates.filter(date => !existingDates.includes(date));

  for (const date of missingDates) {
    await createDay(new Date(date), userId);
  }

  // Fetch again to include newly created days
  const { data: updatedData, error: updatedError } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', userId)
    .in('created_at', dates)
    .order('created_at', { ascending: false });

  if (updatedError) {
    console.error('Error fetching updated recent days:', updatedError);
    return null;
  }

  return updatedData;
}
