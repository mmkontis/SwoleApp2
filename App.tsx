import React from 'react';
import { AuthProvider } from './context/auth';

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
} 