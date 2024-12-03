import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
export const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #f4f4f4;
  padding: 0rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-family: 'Inter', sans-serif; /* Use Inter font for body text */
`;

export const LogoWrapper = styled.div`
  width: 20rem;
  height: 20rem;
`;

export const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const ContentWrapper = styled.div`
  text-align: center;
  max-width: 18.5rem;
  gap: 1rem;
`;

export const Heading = styled.h1`
  font-size: 36px;
  font-weight: bold;
  letter-spacing: -0.015em;
  font-family: 'Poppins', sans-serif; /* Use Poppins font for headings */
`;

export const Paragraph = styled.p`
  font-size: 18px;
  color: #6b7280;
`;

export const ButtonsWrapper = styled.div`
  width: 100%;
  max-width: 17.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Button = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  border-radius: 0.375rem;
  border: ${(props) => (props.variant === 'outline' ? '1px solid #ddd' : 'none')};
  background-color: ${(props) => (props.variant === 'default' ? '#000' : 'transparent')};
  color: ${(props) => (props.variant === 'default' ? '#fff' : '#000')};
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: ${(props) => (props.variant === 'default' ? '#333' : '#f3f4f6')};
  }
`;

// Main component function
function WelcomeScreen() {
  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate('/login'); // Navigate to the login page
  };

  const navigateToCreateAccount = () => {
    navigate('/register'); // Navigate to the create account page
  };

  return (
    <Wrapper>
      {/* Logo */}
      <LogoWrapper>
        <Logo src="/images/tori_logo2.png" alt="Tori Logo" />
      </LogoWrapper>

      {/* Content */}
      <ContentWrapper>
        <Heading>Explore the app</Heading>
        <Paragraph>
          Discover all the tools and features designed to simplify your inventory and sales tracking.
        </Paragraph>
      </ContentWrapper>

      {/* Buttons */}
      <ButtonsWrapper>
        <Button variant="default" onClick={navigateToLogin}>
          Sign In
        </Button>
        <Button variant="outline" onClick={navigateToCreateAccount}>
          Create account
        </Button>
      </ButtonsWrapper>
    </Wrapper>
  );
}

export default WelcomeScreen;
