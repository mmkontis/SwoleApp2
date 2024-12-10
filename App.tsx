import React from 'react';
import { AuthProvider } from './context/auth';
// App.tsx

import Superwall from "@superwall/react-native-superwall";
import { Platform } from "react-native";

export default function App() {
  React.useEffect(() => {
    const apiKey = Platform.OS === "ios" ? "MY_IOS_API_KEY" : "MY_ANDROID_API_KEY"

    Superwall.configure(apiKey)
  }, [])
}


export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
} 