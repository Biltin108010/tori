import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaBox, FaHistory, FaUser } from 'react-icons/fa'; // For icons

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
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &.active {
    color: white;  // Active link color
    font-weight: bold;
  }
`;

const NavIcon = styled.div`
  font-size: 1.5rem;  // Icon size
  color: #676D75;  // Default icon color
  margin-bottom: 0.3rem;

  ${NavLink}.active & {
    color: white;  // Change icon color to white when active
  }
`;

function Nav() {
  const location = useLocation(); // Get current route

  return (
    <NavWrapper>
      <NavLink to="/seller/home" className={location.pathname === '/seller/home' ? 'active' : ''}>
        <NavIcon>
          <FaHome />
        </NavIcon>
        Home
      </NavLink>
      <NavLink to="/seller/inventory" className={location.pathname === '/seller/inventory' ? 'active' : ''}>
        <NavIcon>
          <FaBox />
        </NavIcon>
        Inventory
      </NavLink>
      <NavLink to="/seller/history" className={location.pathname === '/seller/history' ? 'active' : ''}>
        <NavIcon>
          <FaHistory />
        </NavIcon>
        History
      </NavLink>
      <NavLink to="/seller/profile" className={location.pathname === '/seller/profile' ? 'active' : ''}>
        <NavIcon>
          <FaUser />
        </NavIcon>
        Profile
      </NavLink>
    </NavWrapper>
  );
}

export default Nav;
