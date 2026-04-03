import { NavDropdown } from "react-bootstrap";
import styled from "styled-components"

export const StyledUserDropdown = styled(NavDropdown)`
  .dropdown-toggle::after {
    display: none; // Removes the default Bootstrap arrow
  }

  .nav-link {
    color: #333 !important;
    font-size: 1.5rem; // Make icon bigger
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
      color: #007bff !important; // Change color on hover
    }
  }

  .dropdown-menu {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
  }
    .dropdown-menu[data-bs-popper] {
    right: 0;
}
`;

export const CartIconWrapper = styled.div`
   position : relative ;
   margin-right : 20px;
   .cart-icon{
     font-size : 1.5rem
   }
   .cart-count{
   position: absolute;
    top: -5px;
    font-size: 9px;
    background: red;
    color: white;
    bordre: 1px solid #b8b1d6;
    border: 1px solid;
    border-radius: 50%;
    height: 16px;
    width: 16px;
    text-align: center;
    right: -10px;
  }
`