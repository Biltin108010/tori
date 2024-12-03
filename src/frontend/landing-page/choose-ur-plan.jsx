import React, { useState } from "react";
import styled from "styled-components";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import supabase from '../../backend/supabaseClient';
// Styled components
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 2rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px; /* Restrict to the same width as choices and button */
  margin-bottom: 1rem;
`;

export const BackButton = styled(IoIosArrowBack)`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
`;

export const Logo = styled.img`
  width: 4rem;
  height: 4rem;
`;

export const Title = styled.h1`
  font-size: 30px;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  text-align: left; /* Align title to the left */
  margin: 1rem 0 0.5rem;
  width: 100%;
  max-width: 400px;
`;

export const Subtitle = styled.p`
  font-family: 'Inter', sans-serif;
  color: #555;
  font-size: 16px;
  text-align: left; /* Left-aligned text */
  margin: 0 0 1rem;
  width: 100%;
  max-width: 400px;
`;

const PlanCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${({ selected }) => (selected ? "#000" : "#ddd")};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 10px; /* Close spacing between cards */
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? "#f9f9f9" : "#fff")};
  width: 100%;
  max-width: 310px; /* Match the button width */
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #000;
  }
`;

const PlanInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left; /* Ensure text inside is left-aligned */
`;

const PlanTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const PlanPrice = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #333;
  margin: 0.5rem 0 0;
`;

const PlanDetails = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin: 0;
`;

const CircleButton = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid ${({ selected }) => (selected ? "#000" : "#ddd")};
  border-radius: 50%;
  background-color: ${({ selected }) => (selected ? "#000" : "transparent")};
`;

export const ContinueButton = styled.button`
  width: 100%;
  max-width: 400px; /* Align width with plan cards */
  padding: 1rem;
  margin-top: 30px; /* Space between the continue button and choices */
  background-color: #000;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #333;
  }
`;

function ChooseYourPlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false); // To handle loading state

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      alert("Please select a plan before continuing.");
      return;
    }

    setLoading(true);

    try {
      // Fetch the authenticated user's details
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("User not authenticated.");
        console.error("Error fetching user:", userError);
        return;
      }

      const userEmail = user.email;

      // Update the user's plan in the database using the email
      const { error } = await supabase
        .from("users") // Replace with your actual table name
        .update({ plan: selectedPlan })
        .eq("email", userEmail); // Match the user by email

      if (error) {
        console.error("Error updating plan:", error.message);
        alert("An error occurred while updating your plan. Please try again.");
      } else {
        alert(`Plan updated to "${selectedPlan}".`);
        navigate("/seller/home"); // Redirect after successful update
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header>
        <BackButton onClick={() => navigate(-1)} />
        <Logo src="/images/tori_logo2.png" alt="Logo" />
      </Header>
      <Title>Choose your plan</Title>
      <Subtitle>
        To complete the sign-up process, please choose a subscription plan.
      </Subtitle>
      <PlanCard selected={selectedPlan === "starter"} onClick={() => handlePlanSelection("starter")}>
        <PlanInfo>
          <PlanTitle>Starter (up to 4 users)</PlanTitle>
          <PlanPrice>₱250.00 / mo</PlanPrice>
        </PlanInfo>
        <CircleButton selected={selectedPlan === "starter"} />
      </PlanCard>
      <PlanCard selected={selectedPlan === "premium"} onClick={() => handlePlanSelection("premium")}>
        <PlanInfo>
          <PlanTitle>Premium (up to 10 users)</PlanTitle>
          <PlanPrice>₱500.00 / mo</PlanPrice>
        </PlanInfo>
        <CircleButton selected={selectedPlan === "premium"} />
      </PlanCard>
      <PlanCard selected={selectedPlan === "free"} onClick={() => handlePlanSelection("free")}>
        <PlanInfo>
          <PlanTitle>Free</PlanTitle>
          <PlanDetails>Up to 2 users only</PlanDetails>
        </PlanInfo>
        <CircleButton selected={selectedPlan === "free"} />
      </PlanCard>
      <ContinueButton onClick={handleContinue} disabled={loading}>
        {loading ? "Updating..." : "Continue"}
      </ContinueButton>
    </Wrapper>
  );
}

export default ChooseYourPlan;