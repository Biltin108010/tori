import React, { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineSetting, AiOutlineLogout } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import supabase from "../../../backend/supabaseClient"; // Import your Supabase client
import "./admin_profile.css"; // Import the CSS file for styling

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Stores user data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the logged-in user
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching auth user:", error.message);
          setLoading(false);
          return;
        }

        // Fetch user details from your database using the user's email
        const { data, error: queryError } = await supabase
          .from("users") // Replace with your actual table name
          .select("*")
          .eq("email", user.email) // Match by email
          .single(); // Retrieve a single row

        if (queryError) {
          console.error("Error fetching user from DB:", queryError.message);
          setLoading(false);
          return;
        }

        setUser(data); // Update state with the fetched user
      } catch (err) {
        console.error("Unexpected error:", err.message);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login"); // Redirect to login page
    } catch (err) {
      console.error("Error during logout:", err.message);
      alert("Failed to log out. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-scrollable">
        <div className="header-container">
          <h1 className="title">Profile</h1>
          <img src="/images/tori_logo2.png" alt="Logo" className="logo" />
        </div>
        <div className="separator" />

        <div className="profile-header">
          <div className="profile-image-wrapper">
            <img
              className="profile-image"
              src={user?.profile_picture || "https://via.placeholder.com/80"} // Default image if profile picture is null
              alt="Profile"
            />
            <button className="adminedit-button">✏️</button>
          </div>
          <h2 className="name">{user?.username || "Your Name"}</h2>
          <p className="contact">{user?.email || "your.email@example.com"}</p>
        </div>

        <div className="stats-container">
          <div className="stat">
            <p className="stat-value">3</p>
            <p className="stat-label">Users</p>
          </div>
          <div className="stat">
            <p className="stat-value">10</p>
            <p className="stat-label">Items</p>
          </div>
        </div>

        <div className="separator" />

        <button
          className="action-button"
          onClick={() => navigate("/seller/edit-profile")}
        >
          <div className="action-icon">
            <AiOutlineEdit />
          </div>
          Edit Profile Information
        </button>
        <button className="action-button">
          <div className="action-icon">
            <AiOutlineSetting />
          </div>
          Settings
        </button>
        <button className="action-button danger" onClick={handleLogout}>
          <div className="action-icon danger">
            <AiOutlineLogout />
          </div>
          Logout
        </button>
      </div>

      <div className="footer">
        <div className="footer-button">Home</div>
        <div className="footer-button">Inventory</div>
        <div className="footer-button active">History</div>
        <div className="footer-button">Profile</div>
      </div>
    </div>
  );
}

export default Profile;
