import React from "react"
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from "@/assets/vite.svg"
import { CartIconWrapper, StyledUserDropdown } from "@/layout/styles/NavFooterStyle"
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

export const NavBar: React.FC = () => {
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="#">
                        <img src={logo} alt="navbar logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="ms-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Nav.Link href="#action1"><b>Products</b></Nav.Link>
                            <Nav.Link href="#action2">
                                <CartIconWrapper>
                                    {<FaShoppingCart className="cart-icon" />}
                                    <span className="cart-count">3</span>
                                </CartIconWrapper>
                            </Nav.Link>
                            {/* <Form className="d-flex">
                                <Form.Control
                                    type="search"
                                    placeholder="Search"
                                    className="me-2"
                                    aria-label="Search"
                                />
                            </Form> */}

                        </Nav>


                        <StyledUserDropdown title={<FaUserCircle />} id="navbarScrollingDropdown">
                            <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action4">
                                Another action
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action5">
                                Something else here
                            </NavDropdown.Item>
                        </StyledUserDropdown>

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}