import React, { useState, useEffect } from "react";
import "./home.css";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver";
import supabase from "../../../backend/supabaseClient";
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
  const [data, setData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      // Fetch user details
      const { data: userInfo, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      const userEmail = userInfo?.user?.email;

      // Fetch user's team number
      let userTeamNum;
      if (userEmail) {
        const { data: teamInfo, error: teamError } = await supabase
          .from("team")
          .select("team_num")
          .eq("invite", userEmail);

        if (teamError) {
          console.error("Error fetching team information:", teamError.message);
          return;
        }

        userTeamNum = teamInfo?.[0]?.team_num;
      }

      // Fetch all team members' emails (if user is in a team)
      let teamMembers = [];
      if (userTeamNum) {
        const { data: teamData, error: teamDataError } = await supabase
          .from("team")
          .select("invite")
          .eq("team_num", userTeamNum);

        if (teamDataError) {
          console.error("Error fetching team members:", teamDataError.message);
          return;
        }

        teamMembers = teamData.map((member) => member.invite);
      }

      // Fetch total orders
      let totalOrders = 0;
      if (teamMembers.length > 0) {
        // If the user has a team, fetch the total orders for the team
        const { count: orderCount, error: ordersError } = await supabase
          .from("audit_logs")
          .select("*", { count: "exact" })
          .eq("action", "DEDUCTION")
          .in("email", teamMembers);

        if (ordersError) {
          console.error("Error fetching total orders:", ordersError.message);
          return;
        }

        totalOrders = orderCount;
      } else {
        // If the user doesn't have a team, fetch the user's own orders
        const { count: userOrderCount, error: userOrdersError } = await supabase
          .from("audit_logs")
          .select("*", { count: "exact" })
          .eq("action", "DEDUCTION")
          .eq("email", userEmail);

        if (userOrdersError) {
          console.error("Error fetching user orders:", userOrdersError.message);
          return;
        }

        totalOrders = userOrderCount;
      }

      // Fetch audit log summaries for the user
      const { data: userSalesData, error: salesError } = await supabase
        .from("audit_logs")
        .select("price, quantity")
        .eq("email", userEmail); // Only get sales for the current user

      // Initialize team sales data
      let teamSalesData = [];

      // If user has a team, fetch the team's sales
      if (userTeamNum) {
        // Fetch all team members' sales
        const { data: teamSales, error: teamSalesError } = await supabase
          .from("audit_logs")
          .select("price, quantity, email")
          .in("email", teamMembers);

        if (teamSalesError) {
          console.error("Error fetching team sales:", teamSalesError.message);
        } else {
          teamSalesData = teamSales;
        }
      }

      // Combine the user's sales and team sales (if any)
      const allSalesData = userTeamNum ? teamSalesData : userSalesData;

      // Calculate total sales
      const totalSales = allSalesData.reduce(
        (acc, log) => acc + log.price * log.quantity,
        0
      );

      // Update state with the total sales and other information
      setData([
        {
          id: 1,
          title: "Total Team Members",
          value: teamMembers.length || 1, // Display total team members or just the user
          percentage: teamMembers.length > 0 ? "+14%" : "N/A", // Placeholder for dynamic percentage
          graphData: [1, 2, 3, 4, 5], // Placeholder for graph data
        },
        {
          id: 2,
          title: "Total Sales",
          value: `₱${totalSales.toFixed(2)}`,
          percentage: "+12%", // Placeholder for dynamic percentage
          graphData: [1000, 1500, 1800, 2000, 2100], // Placeholder
        },
        {
          id: 3,
          title: "Total Orders",
          value: totalOrders,
          percentage: "+43%", // Placeholder for dynamic percentage
          graphData: [15, 18, 20, 22, 21], // Placeholder
        },
      ]);

      setProfitData([
        { seller: "Seller 1", value: "₱300", percentage: "+2.5%" },
        { seller: "Seller 2", value: "₱560", percentage: "+2.5%" },
        { seller: "Seller 3", value: "₱1,240", percentage: "+2.5%" },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };




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
          <img
            src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png"
            alt="Logo"
            className="home-logo"
          />
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

      {/* Profit Cards */}
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
