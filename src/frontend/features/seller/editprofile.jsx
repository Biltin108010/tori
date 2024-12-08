import React, { useState } from "react";
import styled from "styled-components";
import { IoIosArrowBack } from "react-icons/io";

// Styled Components
const Wrapper = styled.div`
   display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 2rem;
  color: #333;
  font-family: 'Inter', sans-serif;
`;



const Card = styled.div`
  width: 20rem;
  margin-top: -8rem;
  border-radius: 1rem;
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const BackButton = styled(IoIosArrowBack)`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  margin-right: 1rem;

  &:hover {
    color: #000;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 90%;
  padding: 0.80rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #333;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #333;
    outline: none;
  }
`;

const TwoColumns = styled.div`
  display: flex;
  gap: 1rem;
`;

const Column = styled.div`
  width: 50%;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Inter', sans-serif;

  &:hover {
    background-color: #000;
  }
`;

// Component
const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "United States",
    gender: "Female",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <Wrapper>
      <Card>
        <Header>
          <BackButton onClick={() => window.history.back()} />
          <Title>Edit Profile</Title>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleInputChange}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            type="text"
            name="phoneNumber"
            placeholder="Phone number"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
          <TwoColumns>
            <Column>
              <Select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </Select>
            </Column>
            <Column>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </Select>
            </Column>
          </TwoColumns>
          <SubmitButton type="submit">SUBMIT</SubmitButton>
        </Form>
      </Card>
    </Wrapper>
  );
};

export default EditProfile;
