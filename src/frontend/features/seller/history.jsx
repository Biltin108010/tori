import React, { useState } from 'react';
import { FaCartPlus, FaFilter } from 'react-icons/fa'; // Importing specific icons from React Icons
import './history.css';

function History() {
  const [selectedDate, setSelectedDate] = useState('Today');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false); // State for modal visibility

  // Sample data for history items
  const historyData = [
    { id: 1, title: 'Items Sold', seller: 'Seller 1', amount: 60, date: '17 Sep 2023', time: '11:21 AM' },
    { id: 2, title: 'Items Sold', seller: 'Seller 1', amount: 60, date: '17 Sep 2023', time: '11:21 AM' },
  ];

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
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
        <div className="logo">
          <img src="/images/tori_logo2.png" alt="Logo" width={68} height={68} />
        </div>
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
          <FaFilter size={24} /> {/* React Filter Icon */}
        </button>
      </div>

      {/* Filter Modal */}
    {isFilterModalOpen && (
      <div className="filter-modal">
        <div className="filter-modal-content">
        <button className="close-modal-button" onClick={closeFilterModal}>
        ✕
      </button>
          <div className="filter-header">
            <h1 className="filter-title">Filter</h1>

            <button className="clear-button" onClick={() => console.log('Clear filters')}>
              Clear
            </button>
          </div>
          <div className="divider"></div>


          <div className="filter-options">
            <div className="filter-section">
              <h2 className="filter-subtitle">Period</h2>
              <div className="period-options">
                <button className="period-button">Today</button>
                <button className="period-button">This week</button>
                <button className="period-button">This month</button>
                <button className="period-button">Previous month</button>
                <button className="period-button">This year</button>
              </div>
            </div>

            <div className="filter-section">
              <h2 className="filter-subtitle">Select period</h2>
              <div className="date-range">
                <input type="date" className="date-input" />
                <span> - </span>
                <input type="date" className="date-input" />
              </div>
            </div>

            <button className="filter-apply-button">Show results (3261)</button>
          </div>
        </div>
      </div>
    )}


      <div className="history-list">
        {historyData.map((item) => (
          <div key={item.id} className="history-item">
            <FaCartPlus size={24} className="item-icon" /> {/* React Cart Icon */}
            <div className="item-details">
              <div className="title">{item.title}</div>
              <div className="sub-title">Seller Name: {item.seller}</div>
            </div>
            <div className="amount-date">
              <div className="amount">₱ {item.amount.toFixed(2)}</div>
              <div className="sub-date">{`${item.date} ${item.time}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
