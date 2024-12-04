import React, { useState } from "react";
import "./home.css";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver"; // For export functionality
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
  const [isFilterVisible, setFilterVisible] = useState(false);

  const data = [
    {
      id: 1,
      title: "Total Vendors",
      value: 5,
      percentage: "+14%",
      graphData: [3, 4, 5, 6, 5], // Example data points
    },
    {
      id: 2,
      title: "Total Sales",
      value: "₱2,100",
      percentage: "+12%",
      graphData: [1000, 1500, 1800, 2000, 2100],
    },
    {
      id: 3,
      title: "Total Orders",
      value: 21,
      percentage: "+43%",
      graphData: [15, 18, 20, 22, 21],
    },
  ];

  const profitData = [
    { seller: "Seller 1", value: "₱300", percentage: "+2.5%" },
    { seller: "Seller 2", value: "₱560", percentage: "+2.5%" },
    { seller: "Seller 3", value: "₱1,240", percentage: "+2.5%" },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const handleExport = () => {
    const csvContent = [
      ["Title", "Value", "Percentage"],
      ...data.map((item) => [item.title, item.value, item.percentage]),
      ["", "", ""],
      ["Seller", "Profit", "Percentage"],
      ...profitData.map((item) => [item.seller, item.value, item.percentage]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "dashboard_data.csv");
  };

  const toggleFilter = () => {
    setFilterVisible(!isFilterVisible);
  };

  return (
    <div className="home-page-container">
    {/* Header */}
    <div className="home-page-header">
      <h1 className="home-title">Home</h1>
      <div className="home-logo-container">
        <img src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png" alt="Logo" className="home-logo" />
      </div>
    </div>

      <div className="home-divider"></div>

      {/* Controls below the title */}
      <div className="home-controls-container">
        <div className="home-controls">
          <select className="home-dropdown">
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <button className="home-export-button" onClick={handleExport}>
            Export
          </button>
          <button className="home-filter-button" onClick={toggleFilter}>
            Filter
          </button>
        </div>
      </div>

      {/* Card Section */}
      <div className="home-card-section">
        {data.map((item) => (
          <div className="home-card" key={item.id}>
            <div className="home-card-header">
              <span className="home-card-icon">★</span>
              <button className="home-card-menu">⋮</button>
            </div>
            <div className="home-card-body">
              <h2 className="home-card-title">{item.title}</h2>
              <div className="home-card-value">{item.value}</div>
              <div className="home-card-percentage">{item.percentage}</div>
              <div className="home-card-graph">
                <Line
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    datasets: [
                      {
                        data: item.graphData,
                        borderColor: "#27ae60",
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Profit Section */}
      <div className="home-profit-section">
        <h2 className="home-section-title">Total Profit</h2>
        <div className="home-profit-cards">
          {profitData.map((item, index) => (
            <div className="home-profit-card" key={index}>
              <div className="profit-value">{item.value}</div>
              <div className="profit-percentage">{item.percentage}</div>
              <h3>{item.seller}</h3>
            </div>
          ))}
        </div>
      </div>

     {/* Filter Popup */}
{isFilterVisible && (
  <div className="filter-modal">
    <div className="filter-container">
      <button className="close-filter" onClick={toggleFilter}>
         ✕
      </button>
      <h1>Filter</h1>
      {/* Filter Inputs */}
      <div className="filter-input-group">
        <label htmlFor="filter-date-range">Date Range:</label>
        <div className="date-range-container">
          <input
            type="date"
            id="start-date"
            className="filter-date"
            placeholder="Start Date"
          />
          <span className="date-range-separator">to</span>
          <input
            type="date"
            id="end-date"
            className="filter-date"
            placeholder="End Date"
          />
        </div>
      </div>
      <div className="filter-input-group">
        <label htmlFor="filter-category">Category:</label>
        <select id="filter-category" className="filter-select">
          <option value="All">All</option>
          <option value="Vendors">Vendors</option>
          <option value="Sales">Sales</option>
          <option value="Orders">Orders</option>
        </select>
      </div>
      <div className="filter-buttons">
        <button
          className="filter-apply-btn"
          onClick={() => alert("Filters applied!")}
        >
          Apply
        </button>
        <button
          className="filter-reset-btn"
          onClick={() => alert("Filters reset!")}
        >
          Reset
        </button>
      </div>
    </div>
  </div>
)}

      {/* Footer */}
      <div className="home-footer">
        <button className="footer-btn active">Home</button>
        <button className="footer-btn">Inventory</button>
        <button className="footer-btn">History</button>
        <button className="footer-btn">Profile</button>
      </div>
    </div>
  );
}

export default Home;
