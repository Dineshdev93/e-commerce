import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Cop2 from "@/assets/cop2.png"
import { BrandBar, HeroImage, HeroSection, MainHeading, StatItem, StatsContainer, StyledButton, SubText } from "@/components/Home/style/homePageStyle";
// --- Styled Components ---


// --- Component ---

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="py-5">
              <MainHeading>
                FIND CLOTHES <br />
                THAT MATCHES <br />
                YOUR STYLE
              </MainHeading>
              <SubText>
                Browse through our diverse range of meticulously crafted garments, designed 
                to bring out your individuality and cater to your sense of style.
              </SubText>
              
              <StyledButton>
                <Button>

                Shop Now
                </Button>
                </StyledButton>

              <StatsContainer>
                <StatItem>
                  <h3>200+</h3>
                  <p>International Brands</p>
                </StatItem>
                <StatItem>
                  <h3>2,000+</h3>
                  <p>High Quality Products</p>
                </StatItem>
                <StatItem>
                  <h3>30,000+</h3>
                  <p>Happy Customers</p>
                </StatItem>
              </StatsContainer>
            </Col>

            <Col lg={6} className="p-0 position-relative">
              {/* Replace with your actual image path */}
              <HeroImage src={Cop2} alt="models" />
              
              {/* Optional: Decorative Stars if you have the SVG/Icons */}
              <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '3rem'  , color:"rgb(60 59 59)"}}>✦</div>
              <div style={{ position: 'absolute', bottom: '20%', left: '158px',color:"#585151" , fontSize: '1.5rem' }}>✦</div>
            </Col>
          </Row>
        </Container>
      </HeroSection>

      <BrandBar>
        <span>Zara</span>
        <span>Prada</span>
        <span>Gucci</span>
        <span>Calvin Klein</span>
      </BrandBar>
    </>
  );
};

export default HomePage;