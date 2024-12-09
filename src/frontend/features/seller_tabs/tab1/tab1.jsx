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
      setTimeout(() => setFeedbackMessage(''), 3000);
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



  const handleDeleteProduct = async (id) => {
    try {
      // First, delete related records in the audit_logs table
      const { error: auditLogsError } = await supabase
        .from("audit_logs") // Replace with your actual related table name
        .delete()
        .eq("item_id", id); // Assuming `item_id` is the foreign key field in `audit_logs`

      if (auditLogsError) {
        console.error("Error deleting related audit logs:", auditLogsError.message);
        setFeedbackMessage("Failed to delete audit logs. Please try again.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      // Then, delete the product from the inventory table
      const { error } = await supabase
        .from("inventory") // Replace with your actual table name
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting product:", error.message);
        setFeedbackMessage("Failed to delete the product. Please try again.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      await fetchItems(); // Refresh the items after deletion
      setIsModalOpen(false);
      setFeedbackMessage("Product successfully deleted.");
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };


  const handleAddProduct = async (newItem) => {
    if (!userEmail) {
      setFeedbackMessage("You must be logged in to add a product.");
      setTimeout(() => setFeedbackMessage(''), 3000); // Clear the message after 3 seconds
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
        setTimeout(() => setFeedbackMessage(''), 3000); // Clear the message after 3 seconds
        return;
      }

      await fetchItems(); // Fetch the latest items
      setIsModalOpen(false);
      setFeedbackMessage("Product successfully added!");
      setTimeout(() => setFeedbackMessage(''), 3000); // Clear the message after 3 seconds
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => setFeedbackMessage(''), 3000); // Clear the message after 3 seconds
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
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      await fetchItems(); // Refresh the data
      setIsModalOpen(false);
      setFeedbackMessage("Product Added to Cart!");
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => setFeedbackMessage(''), 3000);
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
          setTimeout(() => setFeedbackMessage(''), 3000);
          return;
        }

        await fetchItems(); // Refresh the data
        setFeedbackMessage("Quantity successfully increased!");
        setTimeout(() => setFeedbackMessage(''), 3000);
      } catch (err) {
        console.error("Unexpected error:", err.message);
        setFeedbackMessage("An unexpected error occurred. Please try again.");
        setTimeout(() => setFeedbackMessage(''), 3000);
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
          setTimeout(() => setFeedbackMessage(''), 3000);
          return;
        }

        await fetchItems(); // Refresh the data
        setFeedbackMessage("Quantity successfully decreased!");
        setTimeout(() => setFeedbackMessage(''), 3000);
      } catch (err) {
        console.error("Unexpected error:", err.message);
        setFeedbackMessage("An unexpected error occurred. Please try again.");
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } else {
      setFeedbackMessage("Quantity cannot be less than 1.");
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };


  const handleItemClick = (item, e) => {
    e.stopPropagation(); // Prevent the click event from firing when the + or - icon is clicked
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const EditProductModal = ({ isOpen, onClose, item, onSave, onDelete }) => {
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

    const handleDelete = () => {
      if (item) {
        const confirmed = window.confirm(
          "Are you sure you want to delete this product?"
        );
        if (confirmed) {
          onDelete(item.id);
        }
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
          {item && <button onClick={handleDelete}>Delete</button>}
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
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    try {
      // Fetch the team_num for the logged-in user using the invite column
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("team_num")
        .eq("invite", userEmail)
        .single();

      if (teamError && teamError.code !== 'PGRST116') {
        // Handle errors that are not "No rows found" (PGRST116)
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

      // Prepare the duplicated item with the team_num included (or null)
      const duplicatedItem = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        email: userEmail,
        team_num: teamNum, // Include the team_num or pass null
        created_at: new Date().toISOString(),
        inventory_id: inventoryId,
      };

      // Insert the duplicated item into the add_cart table
      const { error } = await supabase.from("add_cart").insert([duplicatedItem]);

      if (error) {
        console.error("Error duplicating item:", error.message);
        setFeedbackMessage("Failed to add item to cart. Please try again.");
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      setFeedbackMessage("Product successfully added to cart!");
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => setFeedbackMessage(''), 3000);
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
        setTimeout(() => setFeedbackMessage(''), 3000); // Remove message after 3 seconds
        return;
      }

      navigate("/seller/review", { state: { items: data } }); // Pass cart items to ReviewPage
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setFeedbackMessage("An unexpected error occurred.");
      setTimeout(() => setFeedbackMessage(''), 3000); // Remove message after 3 seconds
    }
  };



  return (
    <div className="tab-content">
      {feedbackMessage && (
        <div className="tab-feedback-message">
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
          <div className="tab1-container">
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
        onDelete={handleDeleteProduct}
      />

    </div>
  );
};

export default Tab1;