import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Navigate, useNavigate } from "react-router-dom";
import supabase from "../../../../backend/supabaseClient"; // Import your Supabase client
import "./tab1.css";

const Tab1 = ({ isEditing, handleEditMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [navigateToReview, setNavigateToReview] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Fetch the logged-in user's email
  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching user session:", error.message);
        setFeedbackMessage("Failed to fetch user session. Please try again.");
      } else if (session) {
        setUserEmail(session.user.email);
      }
    };

    fetchUserEmail();
  }, []);

  // Fetch inventory items for the logged-in user
  const fetchItems = async () => {
    if (!userEmail) return; // Wait until the email is set

    const { data, error } = await supabase
      .from("inventory") // Replace with your actual table name
      .select("*")
      .eq("email", userEmail); // Fetch only items belonging to the logged-in user

    if (error) {
      console.error("Error fetching items:", error.message);
      setFeedbackMessage("Failed to fetch items. Please try again later.");
    } else {
      // Sort items alphabetically by name
      const sortedItems = (data || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setItems(sortedItems);
    }
  };

  useEffect(() => {
    fetchItems(); // Call fetchItems to get the latest data
  }, [userEmail]);

  const handleAddProduct = async (newItem) => {
    if (!userEmail) {
      setFeedbackMessage("You must be logged in to add a product.");
      return;
    }

    const itemWithEmail = { ...newItem, email: userEmail };

    try {
      const { error } = await supabase
        .from("inventory") // Replace with your actual table name
        .insert([itemWithEmail]);

      if (error) {
        console.error("Error adding item to database:", error.message);
        setFeedbackMessage("Failed to add the product. Please try again.");
        return;
      }

      await fetchItems(); // Fetch the latest items
      setIsModalOpen(false);
      setFeedbackMessage("Product successfully added!");
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleEditProduct = async (updatedItem) => {
    try {
      const { error } = await supabase
        .from("inventory") // Replace with your actual table name
        .update({
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          price: updatedItem.price,
        })
        .eq("id", updatedItem.id);

      if (error) {
        console.error("Error updating item:", error.message);
        setFeedbackMessage("Failed to update the product. Please try again.");
        return;
      }

      await fetchItems(); // Refresh the data
      setIsModalOpen(false);
      setFeedbackMessage("Product Added to Cart!");
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
    }
  };


  const increaseQuantity = async (id) => {
    const item = items.find((i) => i.id === id);

    if (item) {
      try {
        const { error } = await supabase
          .from("inventory") // Replace with your actual table name
          .update({ quantity: item.quantity + 1 })
          .eq("id", id);

        if (error) {
          console.error("Error increasing quantity:", error.message);
          setFeedbackMessage("Failed to update quantity. Please try again.");
          return;
        }

        await fetchItems(); // Refresh the data
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
          .from("inventory") // Replace with your actual table name
          .update({ quantity: item.quantity - 1 })
          .eq("id", id);

        if (error) {
          console.error("Error decreasing quantity:", error.message);
          setFeedbackMessage("Failed to update quantity. Please try again.");
          return;
        }

        await fetchItems(); // Refresh the data
        setFeedbackMessage("Quantity successfully decreased!");
      } catch (err) {
        console.error("Unexpected error:", err.message);
        setFeedbackMessage("An unexpected error occurred. Please try again.");
      }
    } else {
      setFeedbackMessage("Quantity cannot be less than 1.");
    }
  };


  const handleItemClick = (item, e) => {
    e.stopPropagation(); // Prevent the click event from firing when the + or - icon is clicked
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const EditProductModal = ({ isOpen, onClose, item, onSave }) => {
    const [name, setName] = useState(item ? item.name : "");
    const [quantity, setQuantity] = useState(item ? item.quantity : "");
    const [price, setPrice] = useState(item ? item.price : "");

    const handleSave = () => {
      if (name && quantity && price) {
        onSave({
          ...item,
          name,
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
        });
      }
    };


    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{item ? "Edit Product" : "Add Product"}</h2>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
            />
          </label>
          <label>
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
            />
          </label>
          <label>
            Price:
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
            />
          </label>
          <button onClick={handleSave}>{item ? "Save" : "Add"}</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  if (navigateToReview) {
    return <Navigate to="/seller/review" />;
  }


  const duplicateItem = async (item) => {
    if (!userEmail) {
      setFeedbackMessage("You must be logged in to duplicate a product.");
      return;
    }

    // Check if the item already has the inventory_id
    let inventoryId = item.inventory_id;

    // If inventory_id is not present, fetch it from the inventory table
    if (!inventoryId) {
      try {
        // Assuming item has a unique name or other identifier
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('id')  // Select the id from the inventory table
          .eq('name', item.name)  // Assuming name is unique; adjust if needed
          .single();

        if (inventoryError) {
          console.error("Error fetching inventory item:", inventoryError.message);
          setFeedbackMessage("Failed to fetch inventory item.");
          return;
        }

        inventoryId = inventoryData?.id;  // If found, assign the inventory id

        if (!inventoryId) {
          setFeedbackMessage("Inventory item not found.");
          return;
        }
      } catch (err) {
        console.error("Unexpected error fetching inventory:", err.message);
        setFeedbackMessage("An unexpected error occurred while fetching inventory.");
        return;
      }
    }

    // Proceed with duplicating the item into the cart
    const duplicatedItem = {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      email: userEmail,
      created_at: new Date().toISOString(),
      inventory_id: inventoryId,  // Pass the correct inventory_id
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



  // Fetch cart items to navigate to the ReviewPage
  const handleNavigateToReview = async () => {
    try {
      const { data, error } = await supabase
        .from("add_cart")
        .select("*")
        .eq("email", userEmail); // Filter by user email

      if (error) {
        console.error("Error fetching cart items:", error.message);
        setFeedbackMessage("Failed to fetch cart items.");
        return;
      }

      navigate("/seller/review", { state: { items: data } }); // Pass cart items to ReviewPage
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
    }
  };


  return (
    <div className="tab1-container">
      {feedbackMessage && (
        <div className="feedback-message">
          <p>{feedbackMessage}</p>
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="sticky-button-container">
            <button
              className="add-product-button"
              onClick={() => {
                setSelectedItem(null); // Ensure no item is selected
                setIsModalOpen(true); // Open modal to add a new product
              }}
            >
              Add Product
            </button>
          </div>
          <div className="tab-content">
            {items.map((item) => (
              <div
                key={item.id}
                className="item-box"
                onClick={(e) => handleItemClick(item, e)}
              >
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
                        increaseQuantity(item.id);
                      }}
                    />
                    <AiOutlineMinus
                      className="minus-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseQuantity(item.id);
                      }}
                    />
                  </p>
                  <p className="inv-item-price">Price: ₱{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tab-content">
          {items.map((item) => (
            <div key={item.id} className="item-box">
              <img
                src={item.image || "https://via.placeholder.com/100"}
                alt={item.name}
                className="inv-item-image"
              />
              <div className="item-text-container">
                <p className="item-title">{item.name}</p>
                <p className="item-quantity">Qty: {item.quantity}</p>
                <p className="inv-item-price">Price: ₱{item.price}</p>
                <AiOutlinePlus
                  className="duplicate-icon" // Add custom styling for this icon if needed
                  onClick={() => duplicateItem(item)}
                />
              </div>
            </div>
          ))}
          <button className="tab1-review-order-button" onClick={handleNavigateToReview}>
            Review Order
          </button>
        </div>
      )}

      <EditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSave={selectedItem ? handleEditProduct : handleAddProduct}
      />
    </div>
  );
};

export default Tab1;