import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../../../src/backend/supabaseClient";
import { useUser } from "../../../../src/backend/UserContext";
import { IoIosArrowBack } from "react-icons/io";
import styled from "styled-components";
import "./review_page.css";

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
    const { user } = useUser();
    const userEmail = user?.email;

    const [orderItems, setOrderItems] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    // Fetch cart items on mount
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userEmail) {
                setFeedbackMessage("User is not authenticated.");
                return;
            }

            try {
                const { data: teamData, error: teamError } = await supabase
                    .from("team")
                    .select("team_num")
                    .eq("invite", userEmail)
                    .single();

                let itemsData;

                if (teamError || !teamData) {
                    const { data: individualItems, error: individualError } = await supabase
                        .from("add_cart")
                        .select("*")
                        .eq("user_prev", userEmail);

                    if (individualError) {
                        setFeedbackMessage("Failed to fetch individual cart items.");
                        return;
                    }

                    itemsData = individualItems;
                } else {
                    const teamNum = teamData.team_num;
                    const { data: teamItems, error: teamItemsError } = await supabase
                        .from("add_cart")
                        .select("*")
                        .eq("team_num", teamNum)
                        .eq("user_prev", userEmail);

                    if (teamItemsError) {
                        setFeedbackMessage("Failed to fetch team cart items.");
                        return;
                    }

                    itemsData = teamItems;
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
            const { error } = await supabase
                .from("add_cart")
                .delete()
                .eq("inventory_id", itemId)
                .eq("user_prev", userEmail);

            if (error) {
                console.error("Error removing item:", error.message);
                setFeedbackMessage("Failed to remove the item. Please try again.");
                return;
            }

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

        if (newCounter < 0 || newCounter > item.quantity) {
            return;
        }

        const updatedItems = orderItems.map((orderItem, i) =>
            i === index ? { ...orderItem, counter: newCounter } : orderItem
        );
        setOrderItems(updatedItems);
    };

    const handleConfirmOrder = async () => {
        try {
            // Filter items where counter > 0 and prepare updates
            const updates = orderItems
                .filter((item) => item.counter > 0)
                .map((item) => {
                    if (!item.name) {
                        throw new Error(`Item with ID ${item.inventory_id} is missing a name.`);
                    }
                    return {
                        id: item.inventory_id,
                        quantity: item.quantity - item.counter,
                        name: item.name,
                    };
                });

            if (updates.length === 0) {
                setFeedbackMessage("No items selected to confirm.");
                return;
            }

            console.log("Payload for upsert:", updates);

            // Update the inventory table
            const { error: upsertError } = await supabase.from("inventory").upsert(updates);

            if (upsertError) {
                console.error("Error confirming order:", upsertError.message);
                setFeedbackMessage("Failed to confirm the order. Please try again.");
                return;
            }

            // Get all cart item IDs where user_prev matches the logged-in user
            const cartIds = orderItems
                .filter((item) => item.counter > 0)
                .map((item) => item.inventory_id);

            // Delete cart items where user_prev matches the current user's email
            const { error: deleteError } = await supabase
                .from("add_cart")
                .delete()
                .in("inventory_id", cartIds)
                .eq("user_prev", userEmail); // Ensure only the current user's items are deleted

            if (deleteError) {
                console.error("Error deleting cart items:", deleteError.message);
                setFeedbackMessage("Failed to delete cart items. Please try again.");
                return;
            }

            setFeedbackMessage("Order confirmed successfully!");
            navigate("../inventory");
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage(err.message || "An unexpected error occurred while confirming the order.");
        }
    };


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
                <span className="seller-label">Your Cart!</span>
            </div>
            <div className="order-list">
                {orderItems.map((item, index) => (
                    <div key={item.inventory_id} className="order-item">
                        <img
                            src={item.image || placeholderImage}
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
