import React, { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineSetting, AiOutlineLogout } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import supabase from "../../../backend/supabaseClient"; // Import your Supabase client
import { FiEdit3 } from "react-icons/fi";
import "./profile.css"; // Import the CSS file for styling

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Stores user data
  const [loading, setLoading] = useState(true); // Loading state
  const [teamMembers, setTeamMembers] = useState([]); // Store team members
  const [totalUsers, setTotalUsers] = useState(0); // Total users state (if you want to display the total count)
  const [totalItems, setTotalItems] = useState(0); // Total distinct items in the user's inventory

  const fetchData = async () => {
    try {
      // Fetch user details
      const { data: userInfo, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      const userEmail = userInfo?.user?.email;

      if (!userEmail) {
        console.error("User email not found.");
        return;
      }

      // Set the user info in the state (user data)
      setUser(userInfo.user);

      // Fetch user's team number
      let userTeamNum;
      const { data: teamInfo, error: teamError } = await supabase
        .from("team")
        .select("team_num")
        .eq("invite", userEmail);

      if (teamError) {
        console.error("Error fetching team information:", teamError.message);
        return;
      }

      userTeamNum = teamInfo?.[0]?.team_num;

      // Fetch all team members' emails (if user is in a team)
      if (userTeamNum) {
        const { data: teamData, error: teamDataError } = await supabase
          .from("team")
          .select("invite")
          .eq("team_num", userTeamNum);

        if (teamDataError) {
          console.error("Error fetching team members:", teamDataError.message);
          return;
        }

        // Store team members in state
        setTeamMembers(teamData.map((member) => member.invite));

        // Fetch total number of users in the current team
        const { count } = await supabase
          .from("team")
          .select("*", { count: "exact" })
          .eq("team_num", userTeamNum); // Filter by team number
        setTotalUsers(count);
      }

      // Fetch user's inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("name")
        .eq("email", userEmail);

      if (inventoryError) {
        console.error("Error fetching inventory items:", inventoryError.message);
        return;
      }

      // Count the number of distinct items in the user's inventory
      const distinctItems = new Set(inventoryData.map((item) => item.name)); // Create a Set of unique item names
      setTotalItems(distinctItems.size); // Set the size of the Set as total distinct items

    } catch (error) {
      console.error("Unexpected error:", error.message);
    } finally {
      setLoading(false); // Stop loading spinner after data is fetched
    }
  };

  useEffect(() => {
    fetchData();
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
        <div className="home-page-header">
          <h1 className="home-title">Profile</h1>
          <div className="logo">
            <img src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png" alt="Logo" width={68} height={68} />
          </div>
        </div>

        <div className="home-divider"></div>

        <div className="profile-header">
          <div className="profile-image-wrapper">
            <img
              className="profile-image"
              src={user?.profile_picture || "https://via.placeholder.com/80"} // Default image if profile picture is null
              alt="Profile"
            />
            <FiEdit3 size={24} className="selleredit-button" />
          </div>
          <h2 className="name">{user?.username || "Your Name"}</h2>
          <p className="contact">{user?.email || "your.email@example.com"}</p>
        </div>

        <div className="stats-container">
          <div className="stat">
            <p className="stat-value">{totalUsers}</p> {/* Display total number of users */}
            <p className="stat-label">Users</p>
          </div>
          <div className="stat">
            <p className="stat-value">{totalItems}</p> {/* Display total distinct items */}
            <p className="stat-label">Items</p>
          </div>
        </div>

        <div className="separator" />

        {/* Scrollable Actions Container */}
        <div className="actions-container">
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
          <button
            className="action-button"
            onClick={() => navigate("/seller/invite-team")}
          >
            <div className="action-icon">
              <AiOutlineEdit />
            </div>
            Invite Team
          </button>
          <button
            className="action-button danger"
            onClick={handleLogout}
          >
            <div className="action-icon danger">
              <AiOutlineLogout />
            </div>
            Logout
          </button>
        </div>

        <div className="team-members">
          <h3>Team Members</h3>
          <ul>
            {teamMembers.length > 0 ? (
              teamMembers.map((member, index) => (
                <li key={index}>{member}</li>
              ))
            ) : (
              <p>No team members found.</p>
            )}
          </ul>
        </div>
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
