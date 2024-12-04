import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineUser } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../backend/supabaseClient";
import "../tab1/tab1.css";

const Tab2 = ({ userEmail, userTeamEmails }) => {
  const [items, setItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [navigateToReview, setNavigateToReview] = useState(false);
  const [isApproved, setIsApproved] = useState(null); // New state for approval status
  const navigate = useNavigate();

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

  const increaseQuantity = async (id) => {
    const item = items.find((i) => i.id === id);

    if (item) {
      try {
        const { error } = await supabase
          .from("inventory")
          .update({ quantity: item.quantity + 1 })
          .eq("id", id);

        if (error) {
          console.error("Error increasing quantity:", error.message);
          setFeedbackMessage("Failed to update quantity. Please try again.");
          return;
        }

        fetchInventory(); // Refresh data
        setFeedbackMessage("Quantity successfully increased!");
      } catch (err) {
        console.error("Unexpected error:", err.message);
        setFeedbackMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const decreaseQuantity = async (id) => {
    const item = items.find((i) => i.id === id);

    if (item && item.quantity > 1) {
      try {
        const { error } = await supabase
          .from("inventory")
          .update({ quantity: item.quantity - 1 })
          .eq("id", id);

        if (error) {
          console.error("Error decreasing quantity:", error.message);
          setFeedbackMessage("Failed to update quantity. Please try again.");
          return;
        }

        fetchInventory();
        setFeedbackMessage("Quantity successfully decreased!");
      } catch (err) {
        console.error("Unexpected error:", err.message);
        setFeedbackMessage("An unexpected error occurred. Please try again.");
      }
    } else {
      setFeedbackMessage("Quantity cannot be less than 1.");
    }
  };

  const duplicateItem = async (item) => {
    if (!userEmail) {
      setFeedbackMessage("You must be logged in to duplicate a product.");
      return;
    }

    const duplicatedItem = {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      email: userEmail,
      created_at: new Date().toISOString(),
      inventory_id: item.id,
    };

    try {
      const { error } = await supabase.from("add_cart").insert([duplicatedItem]);

      if (error) {
        console.error("Error duplicating item:", error.message);
        setFeedbackMessage("Already added to cart. Please try again.");
        return;
      }

      setFeedbackMessage("Product successfully added to cart!");
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
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
        return;
      }

      navigate("/seller/review", { state: { items: data } });
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="tab2-container">
      {feedbackMessage && <div className="feedback-message"><p>{feedbackMessage}</p></div>}

      {isApproved === false && !isSearching && (
        <div className="waiting-for-approval">
          <p>Waiting for approval</p>
        </div>
      )}

      {isApproved === true && items.length === 0 && !isSearching && (
        <div className="seller-icon-container">
          <AiOutlineUser className="huge-user-icon" />
        </div>
      )}

      {isApproved === true && items.length > 0 && (
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
                <p className="item-price">Price: ₱{item.price}</p>
                <AiOutlinePlus
                  className="duplicate-icon"
                  onClick={() => duplicateItem(item)}
                />
              </div>
            </div>
          ))}
          <button className="review-order-button" onClick={handleNavigateToReview}>
            Review Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Tab2;
