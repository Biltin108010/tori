import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../../../src/backend/supabaseClient"; // Ensure Supabase is set up correctly
import { IoIosArrowBack } from "react-icons/io";
import styled from "styled-components"; // Import styled-components
import "./review_page.css"; // Your CSS file for styling

// Styled Back Button Component
const BackButton = styled(IoIosArrowBack)`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  margin-right: 2px;

  &:hover {
    color: #000;
  }
`;

const ReviewPage = ({ userEmail }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [orderItems, setOrderItems] = useState([]); // Initialize with an empty array
    const [feedbackMessage, setFeedbackMessage] = useState(""); // For feedback messages

    // Fetch order items from either location.state or the database
    useEffect(() => {
        const fetchCartItems = async () => {
            if (location.state?.items) {
                setOrderItems(
                    location.state.items.map((item) => ({
                        ...item,
                        counter: 1, // Initialize counters to 1 for all items
                    }))
                );
            } else {
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

                    setOrderItems(
                        (data || []).map((item) => ({
                            ...item,
                            counter: 1, // Initialize counters to 1 for fetched items
                        }))
                    );
                } catch (err) {
                    console.error("Unexpected error:", err.message);
                    setFeedbackMessage("An unexpected error occurred while fetching items.");
                }
            }
        };

        fetchCartItems();
    }, [location.state, userEmail]);

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
                        <img src={item.image} alt={item.name} className="item-image" />
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
                        <button className="remove-item">Remove</button>
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
