import React, { useState, useEffect } from "react";
import { AiOutlineMinus, AiOutlineUser } from "react-icons/ai";
import supabase from "../../../../backend/supabaseClient";
import "./tab3.css";

const Tab3 = () => {
  const [items, setItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchTab3Data = async () => {
    setIsSearching(true);

    try {
      // Get the current user's email
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

      // Query the `team` table for the current user's email
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("tab_access, approved") // Use a different column for Tab 3, e.g., `tab_access`
        .eq("email", currentUserEmail)
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

      // Example of unique logic: Query inventory where `tab_access` matches
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("tab_access", "tab3") // Ensure `inventory` has distinct data for Tab 3
        .neq("email", currentUserEmail); // Optional: Filter out current user's inventory from Tab 2

      if (inventoryError) {
        console.error("Error fetching inventory data:", inventoryError.message);
        setFeedbackMessage("Failed to fetch inventory data.");
        setIsSearching(false);
        return;
      }

      if (inventoryData.length === 0) {
        setFeedbackMessage("No inventory items found for Tab 3.");
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
    fetchTab3Data();
  }, []);

  return (
    <div className="tab3-container">
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

export default Tab3;
