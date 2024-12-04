import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { fetchUserSession, subscribeToAuthState } from "./backend/supabaseAuth";

import LoginPage from "./frontend/landing-page/login-acc";
import WelcomePage from "./frontend/landing-page/welcome-page";
import Register from "./frontend/landing-page/create-acc";
import ChooseYourPlan from "./frontend/landing-page/choose-ur-plan";

// Seller Pages
import Nav from "./frontend/features/seller/nav";
import Home from "./frontend/features/seller/home";
import Inventory from "./frontend/features/seller/inventory";
import History from "./frontend/features/seller/history";
import Profile from "./frontend/features/seller/profile";
import EditProfile from "./frontend/features/seller/editprofile";
import InviteTeam from "./frontend/features/seller/InviteTeam";
import Review from "./frontend/features/seller_tabs/review_page";


import { UserProvider } from "./backend/UserContext"; // Import UserContext

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Try to restore user session from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Restore user from localStorage
      } else {
        // Fetch session from Supabase if not in localStorage
        const session = await fetchUserSession();
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem("user", JSON.stringify(session.user)); // Store in localStorage
        }
      }
    };

    fetchUser();

    // Subscribe to auth state changes to update user state on login/logout
    const authListener = subscribeToAuthState((event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user)); // Save to localStorage on login
      } else {
        setUser(null); // Clear user state on logout
        localStorage.removeItem("user"); // Remove from localStorage on logout
      }
    });

    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Protected Route for general user authentication
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Protected Route for admin authentication
  const AdminRoute = ({ children }) => {
    if (!user || user.role !== 'admin') {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <div className="App">
          <Routes>
            {/* Landing Pages */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/choose-ur-plan" element={<ChooseYourPlan />} />
            <Route path="/register" element={<Register />} />

            {/* Seller Pages */}
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute>
                  <Nav />
                  <Routes>
                    <Route path="home" element={<Home />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="history" element={<History />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="edit-profile" element={<EditProfile />} />
                    <Route path="review" element={<Review />} />
                    <Route path="invite-team" element={<InviteTeam />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Admin Pages */}

          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
