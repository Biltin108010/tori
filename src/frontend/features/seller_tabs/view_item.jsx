import React from 'react';
import { useLocation } from 'react-router-dom';
import './view-item.css';

const ViewItem = () => {
  const location = useLocation();
  const { item } = location.state || {};

  if (!item) {
    return <p>No item data available</p>;
  }

  return (
    <div className="view-item-container">
      <h2>Item Details</h2>
      <div className="view-item-box">
        <img src={item.image} alt={item.name} className="view-item-image" />
        <div className="view-item-text">
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Quantity:</strong> {item.quantity}</p>
          <p><strong>Price:</strong> {item.price}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewItem;
