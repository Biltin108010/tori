import React, { useState, useEffect } from "react";
import { AiOutlineMinus, AiOutlineUser } from "react-icons/ai";
import supabase from "../../../../backend/supabaseClient";
import "./tab2.css";

const Tab2 = () => {
  const [items, setItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchInventory = async () => {
    setIsSearching(true);

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching current user:", userError.message);
        setFeedbackMessage("Failed to fetch user data.");
        setIsSearching(false);
        return;
      }

      const currentUserEmail = userData?.user?.email;
      if (!currentUserEmail) {
        setFeedbackMessage("User is not authenticated.");
        setIsSearching(false);
        return;
      }

      // Check the `team` table for both the current user's email and the invitee's email
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("invite, approved, email") // Include both the inviter's email and invitee's email
        .or(`email.eq.${currentUserEmail},invite.eq.${currentUserEmail}`) // Check both columns for the current user
        .single();

      if (teamError || !teamData) {
        console.error("Error fetching team data:", teamError?.message);
        setFeedbackMessage("User not found in the team.");
        setIsSearching(false);
        return;
      }

      if (!teamData.approved) {
        setFeedbackMessage("Access denied. Your invite is not approved.");
        setIsSearching(false);
        return;
      }

      const inviteEmail = teamData.invite;

      if (!inviteEmail) {
        setFeedbackMessage("Invite information is missing for the user.");
        setIsSearching(false);
        return;
      }

      // If current user email is the same as the invite email, fetch the inventory for the inviter's email
      const emailToFetch = currentUserEmail === inviteEmail ? teamData.email : inviteEmail;

      // Fetch inventory where the `email` column matches the correct email
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("email", emailToFetch);

      if (inventoryError) {
        console.error("Error fetching inventory data:", inventoryError.message);
        setFeedbackMessage("Failed to fetch inventory data.");
        setIsSearching(false);
        return;
      }

      if (inventoryData.length === 0) {
        setFeedbackMessage("No inventory items found for the invite.");
      } else {
        setItems(inventoryData);
        setFeedbackMessage("");
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
    }

    setIsSearching(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="tab2-container">
      {feedbackMessage && (
        <div className="feedback-message">
          <p>{feedbackMessage}</p>
        </div>
      )}

      {items.length === 0 && !isSearching && (
        <div className="seller-icon-container">
          <AiOutlineUser className="huge-user-icon" />
        </div>
      )}

      {items.length > 0 && (
        <div className="tab-content">
          {items.map((item) => (
            <div key={item.id} className="item-box">
              <img
                src={item.image || "https://via.placeholder.com/100"}
                alt={item.name}
                className="item-image"
              />
              <div className="item-text-container">
                <p className="item-title">{item.name}</p>
                <p className="item-quantity">
                  Qty: {item.quantity}
                  <AiOutlineMinus
                    className="minus-icon"
                    onClick={() => console.log("Decrease Quantity")}
                  />
                </p>
                <p className="item-price">Price: ₱{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tab2;
