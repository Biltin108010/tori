import React, { useEffect, useState } from 'react';
import { FaCartPlus, FaFilter } from 'react-icons/fa'; // Importing specific icons from React Icons
import supabase from "../../../backend/supabaseClient"; // Import your Supabase client
import './history.css';

function History() {
  const [historyData, setHistoryData] = useState([]); // To store fetched history data
  const [filteredData, setFilteredData] = useState([]); // To store filtered history data
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Today'); // Holds the selected date from dropdown
  const [startDate, setStartDate] = useState(''); // Custom start date
  const [endDate, setEndDate] = useState(''); // Custom end date
  const [userTeamNum, setUserTeamNum] = useState(null); // Team number of the user

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Get the currently authenticated user's email
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError.message);
          return;
        }

        const userEmail = user?.email; // Get the email of the logged-in user

        if (!userEmail) {
          console.error('User is not logged in.');
          return;
        }

        // Fetch the user's team number
        const { data: teamData, error: teamError } = await supabase
          .from('team')
          .select('invite, team_num') // Ensure team_num is included in the query
          .eq('invite', userEmail); // You may adjust this to match your data structure

        if (teamError) {
          console.error('Error fetching team data:', teamError.message);
          return;
        }

        if (!teamData || teamData.length === 0) {
          console.error('No team data found');
          return;
        }

        const userTeamNum = teamData[0]?.team_num; // Get the team number from the data

        // Fetch all team members based on the team number
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team')
          .select('invite')
          .eq('team_num', userTeamNum); // Query all users in the same team

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError.message);
          return;
        }

        const teamEmails = teamMembers.map((member) => member.invite); // Get all user emails in the team

        // Now fetch the history logs for all team members
        const { data: historyData, error: historyError } = await supabase
          .from('audit_logs')
          .select('name, email, price, quantity, created_at')
          .in('email', teamEmails)  // Pass the array of emails for all team members
          .eq('action', 'DEDUCTION');

        if (historyError) {
          console.error('Error fetching history:', historyError.message);
          return;
        }

        if (!Array.isArray(historyData)) {
          console.error('History data is not an array:', historyData);
          return;
        }

        // Log the fetched data for debugging purposes
        console.log("Fetched history data:", historyData);

        // Format the data to include computed total price
        const formattedData = historyData.map((item) => ({
          ...item,
          totalPrice: item.price * item.quantity,
        }));

        setHistoryData(formattedData);
        setFilteredData(formattedData); // Initialize filtered data

      } catch (err) {
        console.error('Unexpected error fetching history:', err.message);
      }
    };

    fetchHistory();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Handle dropdown selection for date filter
  const handleDateChange = (event) => {
    const selected = event.target.value;
    setSelectedDate(selected);

    let filtered = [...historyData];
    const today = new Date();

    if (selected === 'Today') {
      filtered = filtered.filter(
        (item) => new Date(item.created_at).toDateString() === today.toDateString()
      );
    } else if (selected === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      filtered = filtered.filter(
        (item) => new Date(item.created_at).toDateString() === yesterday.toDateString()
      );
    } else if (selected === 'Last Week') {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= lastWeekStart
      );
    } else if (selected === 'Last Month') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= lastMonth
      );
    }

    setFilteredData(filtered);
  };

  // Filter data based on custom date range and other filters
  const applyFilters = () => {
    let filtered = [...historyData];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= start && new Date(item.created_at) <= end
      );
    }

    setFilteredData(filtered);
    toggleFilterModal(); // Close the filter modal after applying filters
  };

  const toggleFilterModal = () => {
    setFilterModalOpen(!isFilterModalOpen);
  };

  const closeFilterModal = () => {
    setFilterModalOpen(false);
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h1 className="history-title">History</h1>
      </header>

      <div className="divider"></div>

      <div className="header-actions">
        <select
          className="filter-dropdown"
          value={selectedDate}
          onChange={handleDateChange}
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="Last Week">Last Week</option>
          <option value="Last Month">Last Month</option>
        </select>
        <button className="filter-icon" onClick={toggleFilterModal}>
          <FaFilter size={24} />
        </button>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="filter-modal">
          <div className="filter-modal-content">
            <button className="close-modal-button" onClick={closeFilterModal}>✕</button>
            <h1 className="filter-title">Filter</h1>
            <div className="divider"></div>
            <div className="filter-options">
              <div className="filter-section">
                <h2 className="filter-subtitle">Custom Date Range</h2>
                <div className="date-range">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <span> - </span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <button className="filter-apply-button" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="history-list">
        {filteredData.map((item) => (
          <div key={item.name} className="history-item">
            <FaCartPlus size={24} className="item-icon" />
            <div className="item-details">
              <div className="title">Name: {item.name}</div>
              <div className="sub-title">Email: {item.email}</div>
            </div>
            <div className="amount-date">
              <div className="amount">
                ₱ {item.totalPrice.toFixed(2)} (Qty: {item.quantity})
              </div>
              <div className="sub-date">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
