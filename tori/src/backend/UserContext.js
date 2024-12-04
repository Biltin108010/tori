import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from './supabaseClient'; // Adjust the path as needed


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserPlan(session.user);
      }
    };

    const fetchUserPlan = async (user) => {
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('email', user.email)
        .single();

      setUser({ ...user, plan: userData.plan });
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserPlan(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
