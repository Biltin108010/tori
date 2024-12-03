import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../../../src/backend/supabaseClient"; // Import your Supabase client
import "./review_page.css"; // Ensure the page is styled properly

const ReviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Set initial state for orderItems with default quantity
    const [orderItems, setOrderItems] = useState(
        (location.state?.items || []).map((item) => ({
            ...item,
            quantity: item.quantity || 1, // Ensure quantity is at least 1
        }))
    );
    const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback message

    const handleQuantityChange = async (index, delta) => {
        const item = orderItems[index];
        const newQuantity = (item.quantity || 1) + delta;

        // Prevent invalid quantities before making any changes
        if (newQuantity < 1 || newQuantity > item.stock) {
            return; // Exit early if the new quantity is out of valid bounds
        }

        try {
            const { error } = await supabase
                .from("inventory")
                .update({ quantity: newQuantity })
                .eq("id", item.id);

            if (error) {
                console.error("Error updating quantity:", error.message);
                setFeedbackMessage("Failed to update quantity. Please try again.");
                return;
            }

            // Update state after successful database update
            const updatedItems = orderItems.map((orderItem, i) =>
                i === index ? { ...orderItem, quantity: newQuantity } : orderItem
            );
            setOrderItems(updatedItems);
            setFeedbackMessage("Quantity updated successfully!");
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage("An unexpected error occurred. Please try again.");
        }
    };


    const handleRemoveItem = async (index) => {
        const item = orderItems[index];

        try {
            const { error } = await supabase
                .from("inventory") // Replace with your table name
                .delete()
                .eq("id", item.id);

            if (error) {
                console.error("Error removing item:", error.message);
                setFeedbackMessage("Failed to remove item. Please try again.");
                return;
            }

            // Remove item from state if the database delete is successful
            setOrderItems(orderItems.filter((_, i) => i !== index));
            setFeedbackMessage("Item removed successfully!");
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage("An unexpected error occurred. Please try again.");
        }
    };

    const handleConfirmOrder = async () => {
        try {
            // Optional: Save the final order state to a different table (e.g., "orders")
            const { error } = await supabase
                .from("orders") // Replace with your orders table
                .insert(orderItems.map(({ id, ...item }) => item)); // Adjust as needed

            if (error) {
                console.error("Error confirming order:", error.message);
                setFeedbackMessage("Failed to confirm order. Please try again.");
                return;
            }

            console.log("Order confirmed:", orderItems);
            setFeedbackMessage("Order confirmed successfully!");
            navigate("../inventory"); // Navigate after confirming
        } catch (err) {
            console.error("Unexpected error:", err.message);
            setFeedbackMessage("An unexpected error occurred. Please try again.");
        }
    };

    const totalAmount = orderItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0), // Default to 0 for invalid values
        0
    );


    return (
        <div className="review-container">
            {feedbackMessage && (
                <div className="feedback-message">
                    <p>{feedbackMessage}</p>
                </div>
            )}
            <button className="back-button" onClick={() => navigate(-1)}>
                &#x2190;
            </button>
            <h1>Review Order</h1>
            <div className="seller-info">
                <span className="seller-label">Seller</span>
                <span className="seller-name">Person 1</span>
            </div>
            <div className="order-list">
                {orderItems.map((item, index) => (
                    <div key={item.id} className="order-item">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-details">
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-price">₱ {item.price.toFixed(2)}</p>
                            <p className="item-stock">In stock: {item.stock}</p>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => handleQuantityChange(index, -1)}
                                    disabled={item.quantity === 1}
                                >
                                    -
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(index, 1)}
                                    disabled={item.quantity === item.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            className="remove-item"
                            onClick={() => handleRemoveItem(index)}
                        >
                            🗑️
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