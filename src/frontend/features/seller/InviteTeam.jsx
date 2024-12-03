import React, { useState, useEffect } from "react";
import supabase from "../../../backend/supabaseClient"; // Import your Supabase client
import { useNavigate } from "react-router-dom"; // For navigating between pages

function InviteTeam() {
  const [emailInput, setEmailInput] = useState(""); // Input field for inviting email
  const [teamData, setTeamData] = useState([]); // Data for the table
  const [pendingInvites, setPendingInvites] = useState([]); // Data for the pending invites
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Navigate hook
  const [currentUserEmail, setCurrentUserEmail] = useState(""); // To store current user's email

  // Function to fetch team data and roles from the users table
  const fetchTeamData = async () => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("team") // Your team table
        .select("*");

      if (teamError) {
        console.error("Error fetching team data:", teamError.message);
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from("users") // Your users table
        .select("email, role"); // Fetching role along with email

      if (usersError) {
        console.error("Error fetching users data:", usersError.message);
        return;
      }

      // Merging team data with roles from users table
      const mergedData = teamData.map((invite) => {
        const user = usersData.find((user) => user.email === invite.invite);
        return { ...invite, role: user ? user.role : "No role assigned" };
      });

      // Filter team data based on current user's email being either in 'email' or 'invite'
      const filteredData = mergedData.filter(
        (invite) => invite.email === currentUserEmail || invite.invite === currentUserEmail
      );

      setTeamData(filteredData); // Set the filtered team data

      // Set pending invites (those that are not approved and where the current user's email is in the 'invite' column)
      setPendingInvites(
        filteredData.filter((invite) => invite.invite === currentUserEmail && invite.approved === false)
      );
    } catch (err) {
      console.error("Error fetching team data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get current user email (to use as the inviter id)
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUserEmail(user.email); // Set the current user's email
      } catch (err) {
        console.error("Error fetching current user:", err.message);
      }
    };

    fetchCurrentUser();
    fetchTeamData();
  }, [currentUserEmail]);

  // Handle invite submission (creating new invite)
  const handleInvite = async () => {
    if (!emailInput.trim()) {
      alert("Please enter a valid email.");
      return;
    }

    if (emailInput === currentUserEmail) {
      alert("You cannot invite yourself!");
      return; // Prevent inviting oneself
    }

    try {
      // Check if this specific email-invite combination already exists
      const { data: duplicateInvite, error: duplicateError } = await supabase
        .from("team")
        .select("*")
        .eq("email", currentUserEmail) // Match current user as inviter
        .eq("invite", emailInput.trim()); // Match invitee email

      if (duplicateError) {
        console.error("Error checking duplicate invite:", duplicateError.message);
        alert("Failed to check for duplicate invites.");
        return;
      }

      if (duplicateInvite.length > 0) {
        alert("This person has already been invited.");
        return; // Prevent duplicate invite
      }

      // Insert the new invite
      const { error } = await supabase
        .from("team")
        .insert([
          {
            email: currentUserEmail, // Set inviter
            invite: emailInput.trim(), // Invitee email
            approved: false, // Default to unapproved
          },
        ]);

      if (error) {
        console.error("Error inserting invite into team table:", error.message);
        alert("Failed to send invite.");
        return;
      }

      alert("Invite sent successfully!");
      setEmailInput(""); // Reset input field
      fetchTeamData(); // Refresh the table
    } catch (err) {
      console.error("Error sending invite:", err.message);
      alert("Failed to send invite.");
    }
  };

  // Handle approval status change
  const handleApprovalChange = async (email, value) => {
    try {
      const isApproved = value === true;

      const { error } = await supabase
        .from("team")
        .update({ approved: isApproved })
        .eq("email", email);

      if (error) {
        console.error("Error updating approval status:", error.message);
        alert("Failed to update approval status.");
        return;
      }

      fetchTeamData(); // Refresh table after approval change
    } catch (err) {
      console.error("Error updating approval status:", err.message);
      alert("Failed to update approval status.");
    }
  };

  // Handle remove account
  const handleRemoveAccount = async (email) => {
    try {
      const { error } = await supabase
        .from("team")
        .delete()
        .eq("email", email);

      if (error) {
        console.error("Error removing account:", error.message);
        alert("Failed to remove account.");
        return;
      }

      alert("Account removed successfully!");
      fetchTeamData(); // Re-fetch to update table after removal
    } catch (err) {
      console.error("Error removing account:", err.message);
      alert("Failed to remove account.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="invite-team-container">
      <h1>Invite Team</h1>

      {/* Invite Input Section */}
      <div className="invite-input">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Enter email to invite"
        />
        <button className="invite-button" onClick={handleInvite}>
          Send Invite
        </button>
      </div>

      {/* Team Table Section */}
      {teamData.length > 0 && (
        <div className="team-table">
          <h2>Team Members</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Invite Status</th>
                <th>Role</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {teamData.map((invite) => (
                <tr key={`${invite.email}-${invite.invite}`}>
                  <td>{invite.invite}</td>
                  <td>{invite.approved ? "Approved" : "Pending"}</td>
                  <td>{invite.role}</td> {/* Display the role */}
                  <td>
                    <button onClick={() => handleRemoveAccount(invite.email)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Invites Table */}
      {pendingInvites.length > 0 && (
        <div className="pending-invites-table">
          <h2>Pending Invites</h2>
          <table>
            <thead>
              <tr>
                <th>Invite</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvites.map((invite) => (
                <tr key={invite.email}>
                  <td>{`${invite.email} is inviting you`}</td>
                  <td>Pending</td>
                  <td>
                    <button onClick={() => handleApprovalChange(invite.email, true)}>
                      ✔️
                    </button>
                    <button onClick={() => handleRemoveAccount(invite.email)}>
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
      </div>

      {/* Confirm Button */}
      <div className="confirm-button-container">
        <button
          className="confirm-button"
          onClick={() => navigate("/seller/profile")}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default InviteTeam;
