import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../../../src/backend/supabaseClient";
import { useUser } from "../../../../src/backend/UserContext"; // Ensure Supabase is set up correctly
import { IoIosArrowBack } from "react-icons/io";
import styled from "styled-components"; // Import styled-components
import "./review_page.css"; // Your CSS file for styling

// Styled Back Button Component
const placeholderImage = "https://via.placeholder.com/100";

const BackButton = styled(IoIosArrowBack)`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  margin-right: 2px;

  &:hover {
    color: #000;
  }
`;

const ReviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser(); // Get the user from context
    const userEmail = user?.email; // Extract email from the user context

    const [orderItems, setOrderItems] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    // Fetch cart items based on user's team
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userEmail) {
                setFeedbackMessage("User is not authenticated.");
                return;
            }

            try {
                // Get team number for the user
                const { data: teamData, error: teamError } = await supabase
                    .from("team")
                    .select("team_num")
                    .eq("invite", userEmail)
                    .single();

                if (teamError || !teamData) {
                    setFeedbackMessage("Failed to fetch team information.");
                    return;
                }

                const teamNum = teamData.team_num;

                // Fetch items for all team members
                const { data: itemsData, error: itemsError } = await supabase
                    .from("add_cart")
                    .select("*")
                    .eq("team_num", teamNum);

                if (itemsError) {
                    setFeedbackMessage("Failed to fetch team cart items.");
                    return;
                }

                setOrderItems(
                    (itemsData || []).map((item) => ({
                        ...item,
                        counter: 1,
                    }))
                );
            } catch (err) {
                console.error("Error fetching cart items:", err.message);
                setFeedbackMessage("An unexpected error occurred.");
            }
        };

        fetchCartItems();
    }, [userEmail]);

    const handleRemoveItem = async (itemId) => {
        try {
            // Remove item from database
            const { error } = await supabase
                .from("add_cart")
                .delete()
                .eq("inventory_id", itemId);

            if (error) {
                console.error("Error removing item:", error.message);
                setFeedbackMessage("Failed to remove the item. Please try again.");
                return;
            }

            // Remove item from state
            const updatedItems = orderItems.filter((item) => item.inventory_id !== itemId);
            setOrderItems(updatedItems);

            setFeedbackMessage("Item removed successfully.");
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage("An unexpected error occurred while removing the item.");
        }
    };

    const handleCounterChange = (index, delta) => {
        const item = orderItems[index];
        const newCounter = item.counter + delta;

        // Prevent counter from going below 0 or exceeding quantity
        if (newCounter < 0 || newCounter > item.quantity) {
            return;
        }

        // Update the counter in the state
        const updatedItems = orderItems.map((orderItem, i) =>
            i === index ? { ...orderItem, counter: newCounter } : orderItem
        );
        setOrderItems(updatedItems);
    };

    const handleConfirmOrder = async () => {
        try {
            // Prepare updates for the inventory table
            const updates = orderItems
                .filter((item) => item.counter > 0) // Only include items with counter > 0
                .map((item) => ({
                    id: item.inventory_id, // Use inventory_id from add_cart as reference to update inventory
                    quantity: item.quantity - item.counter, // Deduct counter from inventory
                    name: item.name, // Include name for update
                }));

            if (updates.length === 0) {
                setFeedbackMessage("No items selected to confirm.");
                return;
            }

            // Update inventory table
            const { error } = await supabase
                .from("inventory")
                .upsert(updates); // Update inventory quantities

            if (error) {
                console.error("Error confirming order:", error.message);
                setFeedbackMessage("Failed to confirm the order. Please try again.");
                return;
            }

            // Clear `add_cart` items after confirming
            const cartIds = orderItems
                .filter((item) => item.counter > 0)
                .map((item) => item.inventory_id); // Use inventory_id for deletion
            await supabase.from("add_cart").delete().in("inventory_id", cartIds); // Delete by inventory_id

            setFeedbackMessage("Order confirmed successfully!");
            navigate("../inventory"); // Redirect to inventory after confirming
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage("An unexpected error occurred while confirming the order.");
        }
    };

    // Calculate the total amount based on selected items
    const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.counter * (item.price || 0),
        0
    );

    return (
        <div className="review-container">
            {feedbackMessage && (
                <div className="feedback-message">
                    <p>{feedbackMessage}</p>
                </div>
            )}
            <div className="review-header">
                <div className="back-logo-container">
                    <div className="back-button-container" onClick={() => navigate(-1)}>
                        <BackButton />
                    </div>
                    <img
                        src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png"
                        alt="Logo"
                        className="header-logo"
                    />
                </div>
                <h1 className="review-title">Review Order</h1>
            </div>
            <div className="seller-info">
                <span className="seller-label">Seller</span>
                <span className="seller-name">Person 1</span>
            </div>
            
            <div className="order-list">
                {orderItems.map((item, index) => (
                    <div key={item.inventory_id} className="order-item">
                        <img 
                            src={item.image || placeholderImage} // Use the placeholder if image is not available
                            alt={item.name} 
                            className="item-image" 
                        />
                        <div className="item-details">
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-price">₱ {item.price.toFixed(2)}</p>
                            <p className="item-quantity">Total quantity: {item.quantity}</p>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => handleCounterChange(index, -1)}
                                    disabled={item.counter === 0}
                                >
                                    -
                                </button>
                                <span>{item.counter}</span>
                                <button
                                    onClick={() => handleCounterChange(index, 1)}
                                    disabled={item.counter === item.quantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            className="remove-item"
                            onClick={() => handleRemoveItem(item.inventory_id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <div className="order-summary">
                <h2>Total: ₱ {totalAmount.toFixed(2)}</h2>
                <button className="confirm-button" onClick={handleConfirmOrder}>
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

export default ReviewPage;
