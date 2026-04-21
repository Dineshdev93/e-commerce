import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
// import './footer.css'
import { Liwrapper } from "./Style/footer2";


export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light pt-3 pb-3  ">
      <Container>
        <Row className="gy-4">
          <Col md={4} sm={12} >
            <h5 className="fw-bold mb-3 ">About Us</h5>
            <p className="small text-secondary  text-white ">
              Your one-stop solution for online shopping, offering the best deals
              and secure payments.
            </p>
          </Col>


          <Col md={2} sm={6}>
            <h6 className="fw-bold mb-3 ">Customer Service</h6>
            <ul className="list-unstyled small">
              <Liwrapper><Link to="/faq" >Help & FAQs</Link></Liwrapper>
              <Liwrapper><Link to="/orders">My Orders</Link></Liwrapper>


            </ul>
          </Col>


          <Col md={2} sm={6}>
            <h6 className="fw-bold mb-3">Policies</h6>
            <ul className="list-unstyled small">
              <Liwrapper><Link to="/privacy" className="footer-link">Privacy Policy</Link></Liwrapper>
              <Liwrapper><Link to="/terms" >Terms of Use</Link></Liwrapper>
            </ul>
          </Col>
          {/* logo */}

          <Col md={3} sm={12}>

            <img src="/footerlogo.png" alt="Footer Logo" className="img-fluid" />


          </Col>

        </Row>

        <hr className="border-secondary my-4" />


        <Row>
          <Col className="text-center small text-secondary ">
            © 2025 iUniShop. Developed by Dinesh Kumar Sharma.
          </Col>
        </Row>
      </Container>

    </footer>
  );
};



