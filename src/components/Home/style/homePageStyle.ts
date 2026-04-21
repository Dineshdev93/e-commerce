import styled from "styled-components";

export const HomePageConatainerStyle = styled.div`
   background-color : rgb(161 76 255)
`

export const HeroSection = styled.section`
  background: linear-gradient(180deg, #1C1C26 0%, #B9FF66 100%);;
  padding-top: 60px;
  overflow: hidden;
  position: relative;
`;

export const MainHeading = styled.h1`
  font-family: 'Inter', sans-serif; // Or a similar bold sans-serif
  font-weight: 900;
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 20px;
  color: #000;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const SubText = styled.p`
  color: rgba(0, 0, 0, 0.6);
  font-size: 1rem;
  margin-bottom: 30px;
  max-width: 90%;
`;

export const StyledButton = styled.button`
  background-color: #000;
  border: none;
  border-radius: 50px;
  padding: 12px 50px;
  font-weight: 500;
  transition: transform 0.2s ease;
color:white;
  &:hover {
    background-color: #f0e3e3;
    transform: scale(1.05);
    color: black;
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 50px;

  @media (max-width: 576px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export const StatItem = styled.div`
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  padding-right: 30px;

  &:last-child {
    border-right: none;
  }

  h3 {
    font-weight: 700;
    margin-bottom: 0;
  }

  p {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.6);
    margin: 0;
  }
`;

export const HeroImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

export const BrandBar = styled.div`
  background-color: #000;
  padding: 40px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  span {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
`;
