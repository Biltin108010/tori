import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaBoxOpen, FaHistory, FaUser, FaHouseUser } from 'react-icons/fa'; // For icons

const NavWrapper = styled.nav`
  display: flex;
  justify-content: space-evenly; /* Even spacing between items */
  align-items: center;
  background-color: #2E2D2D; /* Dark background */
  color: white;
  padding: 0.7rem 0rem; /* Adjusted padding for balanced spacing */
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1;
  gap: 1.5rem; /* Consistent spacing between nav items */
`;

const NavLink = styled(Link)`
  color: #676D75;
  text-decoration: none;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center; /* Keep icon and label stacked vertically */
  padding: 0.5rem;
  transition: all 0.3s ease;
  text-align: center; /* Ensure the label aligns center under icon */

  &.active {
    color: white;  // Active link color
    font-weight: bold;
  }
`;

const NavIcon = styled.div`
  color: #676D75;  // Default icon color
  font-size: 1.8rem; /* Default size for icons */
  margin-bottom: 0.5rem; /* Space between icon and label */

  ${NavLink}.active & {
    color: white;  // Change icon color to white when active
  }
`;

const HomeIcon = styled(NavIcon)`
  font-size: 1.8rem;  /* Larger size for Home */
  margin-bottom: -3px;
`;

const InventoryIcon = styled(NavIcon)`
  font-size: 1.9rem;  /* Slightly larger size for Inventory */
  margin-bottom: -6px;
`;

const HistoryIcon = styled(NavIcon)`
  font-size: 1.5rem;  /* Custom size for History */
  margin-bottom: -1px;
`;

const ProfileIcon = styled(NavIcon)`
  font-size: 1.5rem;  /* Smaller size for Profile */
  margin-bottom: -1px;
`;

const Label = styled.div`
  font-size: 0.9rem;  /* Optional: adjust font size of the label */
`;

function Nav() {
  const location = useLocation(); // Get current route

  return (
    <NavWrapper>
      <NavLink to="/seller/home" className={location.pathname === '/seller/home' ? 'active' : ''}>
        <HomeIcon>
          <FaHouseUser />
        </HomeIcon>
        <Label>Home</Label>
      </NavLink>
      <NavLink to="/seller/inventory" className={location.pathname === '/seller/inventory' ? 'active' : ''}>
        <InventoryIcon>
          <FaBoxOpen />
        </InventoryIcon>
        <Label>Inventory</Label>
      </NavLink>
      <NavLink to="/seller/history" className={location.pathname === '/seller/history' ? 'active' : ''}>
        <HistoryIcon>
          <FaHistory />
        </HistoryIcon>
        <Label>History</Label>
      </NavLink>
      <NavLink to="/seller/profile" className={location.pathname === '/seller/profile' ? 'active' : ''}>
        <ProfileIcon>
          <FaUser />
        </ProfileIcon>
        <Label>Profile</Label>
      </NavLink>
    </NavWrapper>
  );
}

export default Nav;
