'use client';

import React, { useEffect, useState } from 'react';
import Tab1 from './tab1/tab1';
import Tab2 from './tab2/tab2';
import Tab3 from './tab3/tab3';
import './TabsContainer.css';
import supabase from '../../../backend/supabaseClient'; // Ensure you import your Supabase client

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState(1);  // Default to Tab 2 (index 1)
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null); // To store the user's role
  const [email, setEmail] = useState(null); // To store the user's email
  const [username, setUsername] = useState(''); // To store the username
  const [users, setUsers] = useState([]); // To store all users from the database

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  // Fetch user details and users list
  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user }, error } = await supabase.auth.getUser(); // Fetch the current user

      if (error) {
        console.error("Error fetching user details:", error);
        return;
      }

      if (user) {
        setEmail(user.email); // Set the user's email

        // Fetch the username and role of the user based on their email
        const { data, error: roleError } = await supabase
          .from('users') // Replace 'users' with your actual table name that stores roles and usernames
          .select('username, role')
          .eq('email', user.email)
          .single();

        if (roleError) {
          console.error("Error fetching user role and username:", roleError);
        } else if (data) {
          setUsername(data.username); // Set the user's username
          setUserRole(data.role); // Set the user's role
        }
      }
    };

    const fetchAllUsers = async () => {
      const { data: allUsers, error } = await supabase
        .from('users') // Fetch all users
        .select('username');

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(allUsers); // Set the list of users
      }
    };

    fetchUserDetails();
    fetchAllUsers();
  }, []);

  // Render the correct tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Tab1 isEditing={isEditing} handleEditMode={toggleEditMode} />;
      case 1:
        return <Tab2 isEditing={isEditing} />;
      case 2:
        return <Tab3 isEditing={isEditing} />;
      default:
        return null;
    }
  };

  // Determine if the Edit button should be visible
  const shouldShowEditButton = () => {
    if (userRole === 'admin') {
      return true; // Admin can see the edit button on all tabs
    }
    if (userRole === 'seller' && activeTab === 0) {
      return true; // Seller can only see the edit button on Tab 1
    }
    return false; // Otherwise, no edit button
  };

  // Default to Tab 2 if no users exist
  useEffect(() => {
    if (users.length === 0) {
      setActiveTab(1);  // Default to Tab 2
    }
  }, [users]);

  return (
    <div className="tab-container">
      <div className="header">
      <div className="header-wrapper">
            <div className="title">
              {isEditing && (
                <button className="back-button" onClick={toggleEditMode}>
                  &#8592;
                </button>
              )}
              <h2>Inventory</h2>
              <div className="tabscontentlogo">
              <img src="/images/tori_logo2.png" alt="Logo" width={50} height={50} />
              </div>
            </div>
          </div>

          <div className="search-box-wrapper">
            <input
              type="search"
              placeholder="Search product"
              className="search-input"
            />
            {/* Render Edit button based on userRole and activeTab */}
            {!isEditing && shouldShowEditButton() && (
              <button className="edit-button" onClick={toggleEditMode}>
                Edit
              </button>
            )}
          </div>
        </div>

      {/* Tabs */}
      <div className="tabs">
        {username && (
          <button
            onClick={() => setActiveTab(0)}
            className={`tab ${activeTab === 0 ? 'active-tab' : ''}`}
          >
            {username}
          </button>
        )}
        {users.length > 0 && (
          <>
            <button
              onClick={() => setActiveTab(1)}
              className={`tab ${activeTab === 1 ? 'active-tab' : ''}`}
            >
              Tab 2
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`tab ${activeTab === 2 ? 'active-tab' : ''}`}
            >
              Tab 3
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}
