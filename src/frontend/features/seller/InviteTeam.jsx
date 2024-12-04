import React, { useState, useEffect } from "react";
import supabase from "../../../backend/supabaseClient"; // Import your Supabase client
import { useNavigate } from "react-router-dom"; // For navigating between pages

function InviteTeam() {
  const [emailInput, setEmailInput] = useState(""); // Input field for inviting email
  const [teamData, setTeamData] = useState([]); // Data for team members
  const [pendingInvites, setPendingInvites] = useState([]); // Pending invites
  const [loading, setLoading] = useState(true); // Loading state
  const [isAlreadyInvited, setIsAlreadyInvited] = useState(false); // Track if current user is already invited
  const navigate = useNavigate(); // Navigate hook
  const [currentUserEmail, setCurrentUserEmail] = useState(""); // Current user's email
  const [currentTeamNum, setCurrentTeamNum] = useState(null); // Current user's team number
  const [isTeamFull, setIsTeamFull] = useState(false); // Track if the team is full
  const [isInviter, setIsInviter] = useState(false); // Track if the current user is the inviter
  const [isApproved, setIsApproved] = useState(false); // Track if the current user is approved
  const [canInvite, setCanInvite] = useState(true); // Track if the user can invite others

  // Fetch team data
  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Fetch current user's team number
      const { data: teamInfo, error: teamError } = await supabase
        .from("team")
        .select("team_num")
        .eq("invite", currentUserEmail)
        .limit(1);

      if (teamError) {
        console.error("Error fetching team number:", teamError.message);
        return;
      }

      const teamNum = teamInfo?.[0]?.team_num || currentTeamNum;
      setCurrentTeamNum(teamNum);

      // Fetch all members with the same team number
      const { data: teamData, error: teamDataError } = await supabase
        .from("team")
        .select("invite, approved, team_num, inviter") // Select inviter too
        .eq("team_num", teamNum);

      if (teamDataError) throw teamDataError;

      setTeamData(teamData);

      // Fetch only the pending invites where approved is false and the invite is for the current user
      const pending = teamData.filter((member) => member.invite === currentUserEmail && !member.approved);
      setPendingInvites(pending);

      // Check if the current user is already invited
      const userAlreadyInvited = teamData.some((member) => member.invite === currentUserEmail);
      setIsAlreadyInvited(userAlreadyInvited);

      // Check if the current user is the inviter and their approval status
      const user = teamData.find((member) => member.invite === currentUserEmail);
      setIsInviter(user?.inviter);
      setIsApproved(user?.approved);

      // Check if the team is full (i.e., has 3 or more approved members)
      const teamSize = teamData.filter((member) => member.approved).length;
      if (teamSize >= 3) {
        alert("Your team is already full!");
        return;
      }

      // Disable the invite button if the user is invited but not an inviter
      setCanInvite(!(user?.inviter === false && user?.approved === false));
    } catch (err) {
      console.error("Error fetching team data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUserEmail(user.email);
      } catch (err) {
        console.error("Error fetching current user:", err.message);
      }
    };
    fetchCurrentUser();
  }, []); // Runs once on component mount

  // Fetch team data once current user email is available
  useEffect(() => {
    if (currentUserEmail) {
      fetchTeamData(); // Fetch all data initially
    }
  }, [currentUserEmail]);

  // Handle sending an invite
// Handle sending an invite
const handleInvite = async () => {
  if (!emailInput.trim()) {
    alert("Please enter a valid email.");
    return;
  }

  if (emailInput === currentUserEmail) {
    alert("You cannot invite yourself!");
    return;
  }

  try {
    // Fetch current user's team info and check if they are already part of a team
    const { data: inviterData, error: inviterError } = await supabase
      .from("team")
      .select("team_num, approved")
      .eq("invite", currentUserEmail)
      .eq("approved", true)
      .limit(1);

    if (inviterError) {
      console.error("Error fetching inviter data:", inviterError.message);
      return;
    }

    let teamNum = currentTeamNum;
    if (!inviterData || inviterData.length === 0) {
      console.log("Creating new team for the user...");

      // Fetch the max team number and increment
      const { data: maxTeamNumData, error: maxTeamNumError } = await supabase
        .from("team")
        .select("team_num")
        .order("team_num", { ascending: false })
        .limit(1);

      if (maxTeamNumError) throw maxTeamNumError;

      const newTeamNum = (maxTeamNumData?.[0]?.team_num || 0) + 1;
      teamNum = newTeamNum;

      // Insert a new row with the current user and their team number
      const { error: insertError } = await supabase
        .from("team")
        .insert([{ invite: currentUserEmail, approved: true, team_num: teamNum, inviter: true }]);

      if (insertError) throw insertError;

      setCurrentTeamNum(teamNum); // Update the state with the new team number
    }

    // Fetch the count of members in the team to check if it's already full
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("team")
      .select("invite")
      .eq("team_num", teamNum);

    if (teamMembersError) throw teamMembersError;

    // Check the team size (count of team members with the same team_num)
    const teamSize = teamMembers.length;
    if (teamSize >= 3) {
      alert("Your team is already full!");
      return;
    }

    // Check if the person is already invited
    const { data: duplicateInvite, error: duplicateError } = await supabase
      .from("team")
      .select("*")
      .eq("invite", emailInput.trim())
      .eq("team_num", teamNum)
      .limit(1);

    if (duplicateError) throw duplicateError;

    if (duplicateInvite.length > 0) {
      alert("This person has already been invited.");
      return;
    }

    // Insert the invite with the correct team number
    const { error: inviteError } = await supabase
      .from("team")
      .insert([{
        invite: emailInput.trim(),
        approved: false,
        team_num: teamNum,
        inviter: false,
      }]);

    if (inviteError) throw inviteError;

    alert("Invite sent successfully!");
    setEmailInput(""); // Reset input field
    fetchTeamData(); // Refresh the team data
  } catch (err) {
    console.error("Error sending invite:", err.message);
    alert("Failed to send invite.");
  }
};



  // Handle approval status change
  const handleApprovalChange = async (invite, value) => {
    try {
      if (value === false) {
        const { error } = await supabase
          .from("team")
          .delete()
          .eq("invite", invite)
          .eq("team_num", currentTeamNum);

        if (error) throw error;

        alert("Invite rejected and removed successfully!");
      } else {
        const { error } = await supabase
          .from("team")
          .update({ approved: value })
          .eq("invite", invite)
          .eq("team_num", currentTeamNum);

        if (error) throw error;

        alert("Invite approved successfully!");
      }

      fetchTeamData(); // Refresh the table
    } catch (err) {
      console.error("Error updating approval status:", err.message);
      alert("Failed to update approval status.");
    }
  };

  // Handle remove account
  const handleRemoveAccount = async (invite) => {
    try {
      const { error } = await supabase
        .from("team")
        .delete()
        .eq("invite", invite)
        .eq("team_num", currentTeamNum);

      if (error) throw error;

      alert("Account removed successfully!");
      fetchTeamData(); // Refresh the table
    } catch (err) {
      console.error("Error removing account:", err.message);
      alert("Failed to remove account.");
    }
  };

  // Handle leave team
  const handleLeaveTeam = async () => {
    try {
      const { error } = await supabase
        .from("team")
        .delete()
        .eq("invite", currentUserEmail)
        .eq("team_num", currentTeamNum);

      if (error) throw error;

      alert("You have left the team!");
      fetchTeamData(); // Refresh the table
    } catch (err) {
      console.error("Error leaving team:", err.message);
      alert("Failed to leave the team.");
    }
  };

  // Handle disband team
  const handleDisbandTeam = async () => {
    try {
      const { error } = await supabase
        .from("team")
        .delete()
        .eq("team_num", currentTeamNum);

      if (error) throw error;

      alert("The team has been disbanded!");
      fetchTeamData(); // Refresh the table
    } catch (err) {
      console.error("Error disbanding team:", err.message);
      alert("Failed to disband the team.");
    }
  };

  return (
    <div>
      {/* Render Pending Invites for Invited User */}
      {pendingInvites.length > 0 && !isTeamFull && (
        <div>
          <h2>Pending Invites</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvites.map((invite) => (
                <tr key={invite.invite}>
                  <td>{invite.invite}</td>
                  <td>{invite.approved ? "Approved" : "Pending"}</td>
                  <td>
                    <button onClick={() => handleApprovalChange(invite.invite, true)}>Approve</button>
                    <button onClick={() => handleApprovalChange(invite.invite, false)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Team Members */}
      <div>
        <h2>Team Members</h2>
        {teamData.length === 0 && <p>No team members yet.</p>}
        {teamData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamData.map((member) => (
                <tr key={member.invite}>
                  <td>{member.invite}</td>
                  <td>{member.approved ? "Approved" : "Pending"}</td>
                  <td>
                    {/* Show "Remove" only if the current user is the inviter */}
                    {isInviter && member.invite !== currentUserEmail && (
                      <button onClick={() => handleRemoveAccount(member.invite)}>Remove</button>
                    )}
                    {/* Show "Leave Team" or "Disband Team" depending on current user's status */}
                    {member.invite === currentUserEmail && !isInviter && (
                      <button onClick={handleLeaveTeam}>Leave Team</button>
                    )}
                    {isInviter && member.invite === currentUserEmail && isApproved && (
                      <button onClick={handleDisbandTeam}>Disband Team</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Form */}
      <div>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          disabled={!canInvite || isTeamFull}
          placeholder="Enter email to invite"
        />
        <button onClick={handleInvite} disabled={!canInvite || isTeamFull}>
          Send Invite
        </button>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
      </div>
    </div>
  );
}

export default InviteTeam;
