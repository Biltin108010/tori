import React, { useState } from "react";
import styled from "styled-components";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import supabase from '../../backend/supabaseClient';

// Styled components
export const PlanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 2rem;
`;

export const PlanHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
`;

export const BackIcon = styled(IoIosArrowBack)`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
`;

export const PlanLogo = styled.img`
  width: 4rem;
  height: 4rem;
`;

export const PlanTitle = styled.h1`
  font-size: 30px;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  text-align: left;
  margin: 1rem 0 0.5rem;
  width: 100%;
  max-width: 400px;
`;

export const PlanSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  color: #555;
  font-size: 16px;
  text-align: left;
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
  margin-bottom: 10px;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? "#f9f9f9" : "#fff")};
  width: 100%;
  max-width: 310px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #000;
  }
`;

const PlanInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const PlanDetailsTitle = styled.h2`
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

const SelectionCircle = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid ${({ selected }) => (selected ? "#000" : "#ddd")};
  border-radius: 50%;
  background-color: ${({ selected }) => (selected ? "#000" : "transparent")};
`;

export const PlanContinueButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  margin-top: 30px;
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
  const [loading, setLoading] = useState(false);

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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("User not authenticated.");
        console.error("Error fetching user:", userError);
        return;
      }

      const userEmail = user.email;

      const { error } = await supabase
        .from("users")
        .update({ plan: selectedPlan })
        .eq("email", userEmail);

      if (error) {
        console.error("Error updating plan:", error.message);
        alert("An error occurred while updating your plan. Please try again.");
      } else {
        alert(`Plan updated to "${selectedPlan}".`);
        navigate("/seller/home");
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlanWrapper>
      <PlanHeader>
        <BackIcon onClick={() => navigate(-1)} />
        <PlanLogo src="https://res.cloudinary.com/dcd5cnr4m/image/upload/v1733254195/Untitled_design_7_td7pot.png" alt="Logo" />
      </PlanHeader>
      <PlanTitle>Choose your plan</PlanTitle>
      <PlanSubtitle>
        To complete the sign-up process, please choose a subscription plan.
      </PlanSubtitle>
      <PlanCard selected={selectedPlan === "starter"} onClick={() => handlePlanSelection("starter")}>
        <PlanInfo>
          <PlanDetailsTitle>Starter (up to 4 users)</PlanDetailsTitle>
          <PlanPrice>₱250.00 / mo</PlanPrice>
        </PlanInfo>
        <SelectionCircle selected={selectedPlan === "starter"} />
      </PlanCard>
      <PlanCard selected={selectedPlan === "premium"} onClick={() => handlePlanSelection("premium")}>
        <PlanInfo>
          <PlanDetailsTitle>Premium (up to 10 users)</PlanDetailsTitle>
          <PlanPrice>₱500.00 / mo</PlanPrice>
        </PlanInfo>
        <SelectionCircle selected={selectedPlan === "premium"} />
      </PlanCard>
      <PlanCard selected={selectedPlan === "free"} onClick={() => handlePlanSelection("free")}>
        <PlanInfo>
          <PlanDetailsTitle>Free</PlanDetailsTitle>
          <PlanDetails>Up to 2 users only</PlanDetails>
        </PlanInfo>
        <SelectionCircle selected={selectedPlan === "free"} />
      </PlanCard>
      <PlanContinueButton onClick={handleContinue} disabled={loading}>
        {loading ? "Updating..." : "Continue"}
      </PlanContinueButton>
    </PlanWrapper>
  );
}

export default ChooseYourPlan;
