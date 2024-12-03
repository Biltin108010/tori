// src/backend/supabaseAuth.js
import supabase from './supabaseClient'; // Import your Supabase client

// Function to fetch the current user session
export const fetchUserSession = async () => {
  const { data: { user } } = await supabase.auth.getSession();
  return user;
};

// Function to handle sign in
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

// Function to handle sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  return true;
};

// Function to subscribe to auth state changes
export const subscribeToAuthState = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};


