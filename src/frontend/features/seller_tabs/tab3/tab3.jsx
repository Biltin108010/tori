import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineUser } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../backend/supabaseClient";
import "../tab1/tab1.css";

const Tab3 = ({ userEmail, userTeamEmails, currentLoggedInUserEmail }) => {

  const [items, setItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [navigateToReview, setNavigateToReview] = useState(false);
  const [isApproved, setIsApproved] = useState(null); // New state for approval status
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchInventory = async () => {
    setIsSearching(true);

    try {
      if (!userEmail) {
        setFeedbackMessage("No user email provided.");
        setIsSearching(false);
        return;
      }

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("email", userEmail);

      if (inventoryError) {
        console.error("Error fetching inventory data:", inventoryError.message);
        setFeedbackMessage("Failed to fetch inventory data.");
        setIsSearching(false);
        return;
      }

      if (inventoryData.length === 0) {
        setFeedbackMessage("No inventory items found for this user.");
      } else {
        setItems(
          inventoryData.sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical sort
        );
        setFeedbackMessage("");
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
    }

    setIsSearching(false);
  };
  useEffect(() => {
    const fetchCartItemCount = async () => {
      if (!currentLoggedInUserEmail) return; // Use currentLoggedInUserEmail instead of userEmail
      
      try {
        // Fetch the count of cart items where the user_prev matches the current user's email
        const { data: cartItems, error } = await supabase
          .from("add_cart")
          .select("id")
          .eq("user_prev", currentLoggedInUserEmail); // Use currentLoggedInUserEmail
  
        if (error) {
          console.error("Error fetching cart items:", error.message);
          return;
        }
  
        setCartItemCount(cartItems?.length || 0); // Set the cart item count based on currentLoggedInUserEmail
      } catch (err) {
        console.error("Error fetching cart items:", err.message);
      }
    };
  
    // Fetch the initial count on component mount
    fetchCartItemCount();
  
    // Set up polling every 5 seconds (5000 ms)
    const intervalId = setInterval(fetchCartItemCount, 5000); // You can adjust the interval time as needed
  
    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [currentLoggedInUserEmail]); // Update dependency to currentLoggedInUserEmail
  
  
  
  
  const checkApprovalStatus = async () => {
    try {
      if (!userEmail) {
        setFeedbackMessage("No user email provided.");
        return;
      }

      // Fetch the team data for the current user
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("approved, team_num")
        .eq("invite", userEmail) // Check the invite column for the current user
        .single(); // Assuming only one entry for each user

      if (teamError) {
        console.error("Error fetching team data:", teamError.message);
        setFeedbackMessage("Failed to fetch team data.");
        return;
      }

      if (teamData && teamData.approved) {
        setIsApproved(true); // User is approved
        fetchInventory(); // Proceed to fetch the inventory data
      } else {
        setIsApproved(false); // User is not approved
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred while checking approval.");
    }
  };

  useEffect(() => {
    if (userEmail) {
      checkApprovalStatus();
    }
  }, [userEmail]);



  const duplicateItem = async (item) => {
    if (!currentLoggedInUserEmail) {
      setFeedbackMessage("You must be logged in to duplicate a product.");
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }
  
    try {
      // Fetch the team_num for the logged-in user using the invite column
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("team_num")
        .eq("invite", currentLoggedInUserEmail) // Use currentLoggedInUserEmail
        .single();
  
      if (teamError && teamError.code !== "PGRST116") {
        console.error("Error fetching team number:", teamError.message);
        setFeedbackMessage("Failed to fetch team information.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }
  
      const teamNum = teamData?.team_num || null; // Default to null if no team_num is found
  
      // Check if the item already has the inventory_id
      let inventoryId = item.inventory_id;
  
      if (!inventoryId) {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select("id")
          .eq("name", item.name)
          .single();
  
        if (inventoryError) {
          console.error("Error fetching inventory item:", inventoryError.message);
          setFeedbackMessage("Failed to fetch inventory item.");
          setTimeout(() => setFeedbackMessage(''), 3000);
          return;
        }
  
        inventoryId = inventoryData?.id || null;
  
        if (!inventoryId) {
          setFeedbackMessage("Inventory item not found.");
          setTimeout(() => setFeedbackMessage(''), 3000);
          return;
        }
      }
  
      // Check for duplicate entries in the add_cart table
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from("add_cart")
        .select("id")
        .eq("name", item.name) // Match by name
        .eq("user_prev", currentLoggedInUserEmail); // Match by user_prev
  
      if (duplicateError) {
        console.error("Error checking for duplicates:", duplicateError.message);
        setFeedbackMessage("Failed to verify duplicate entries.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }
  
      if (duplicateCheck && duplicateCheck.length > 0) {
        // Duplicate exists, provide feedback
        setFeedbackMessage("Item already exists in the Review Order.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }
  
      // Prepare the duplicated item
      const duplicatedItem = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        email: item.email, // Original item's owner email
        user_prev: currentLoggedInUserEmail, // Set user_prev to the logged-in user's email
        team_num: teamNum, // Include the team_num or null
        created_at: new Date().toISOString(),
        inventory_id: inventoryId,
      };
  
      // Insert the duplicated item into the add_cart table
      const { error } = await supabase.from("add_cart").insert([duplicatedItem]);
  
      if (error) {
        console.error("Error duplicating item:", error.message);
        setFeedbackMessage("Failed to duplicate the item.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }
  
      // Success feedback
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };
  
  


  const handleNavigateToReview = async () => {
    try {
      const { data, error } = await supabase
        .from("add_cart")
        .select("*")
        .eq("email", userEmail);

      if (error) {
        console.error("Error fetching cart items:", error.message);
        setFeedbackMessage("Failed to fetch cart items.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      navigate("/seller/review", { state: { items: data } });
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  return (
    <div className="tab-content">
      {feedbackMessage && (
        <div className="tab-feedback-message">
          <p>{feedbackMessage}</p>
        </div>
      )}

      {isApproved === false && !isSearching && (
        <div className="waiting-for-approval">
          <p>Waiting for approval.</p>
        </div>
      )}

      {isApproved === true && items.length > 0 && (
        <div className="tab1-container">
          {items.map((item) => (
            <div key={item.id} className="item-box">
              <img
                src={item.image || "https://via.placeholder.com/100"}
                alt={item.name}
                className="inv-item-image"
              />
              <div className="item-text-container">
                <p className="item-title">{item.name}</p>
                <p className="item-quantity">
                  Qty: {item.quantity}
                  <AiOutlinePlus
                    className="plus-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateItem(item);
                    }}
                  />
                </p>
                <p className="inv-item-price">Price: ₱{item.price}</p>
              </div>
            </div>
          ))}
          <button
            className="tab1-review-order-button"
            onClick={handleNavigateToReview}
          >
            Review Order
            {cartItemCount > 0 && (
              <span className="notification-bubble">{cartItemCount}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
export default Tab3;

