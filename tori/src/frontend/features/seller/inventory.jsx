import React, { useState } from "react";
import TabsContainer from "../seller_tabs/TabsContainer";
import "./inventory.css";  // We will create a CSS file for styling

const Inventory = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="inventory">
      <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Inventory;
