import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import { NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
const NavBar = ({ user }) => {
  const loggedIn = user !== null;
  return (
    <Navbar>
      <Nav.Item>
        <Nav.Link className="navbar-brand" disabled>
          VipVeed
        </Nav.Link>
      </Nav.Item>
      <LinkContainer to="/home">
        <Nav.Link>Home</Nav.Link>
      </LinkContainer>
      <NavDropdown title="Bridge" id="nav-dropdown">
        <NavDropdown.Item>
          <LinkContainer to="/deals">
            <Nav.Link disabled={!loggedIn}>View Deals</Nav.Link>
          </LinkContainer>
        </NavDropdown.Item>
        <LinkContainer to="/bridge">
          <Nav.Link>Start Deal</Nav.Link>
        </LinkContainer>
      </NavDropdown>
      <LinkContainer to="/tictactoe">
        <Nav.Link>TicTacToe</Nav.Link>
      </LinkContainer>
      {!loggedIn && (
        <React.Fragment>
          <LinkContainer to="/login">
            <Nav.Link>Login</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/register">
            <Nav.Link>Register</Nav.Link>
          </LinkContainer>
        </React.Fragment>
      )}
      {loggedIn && (
        <React.Fragment>
          <LinkContainer to="/profile">
            <Nav.Link> Profile</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/logout">
            <Nav.Link>Logout</Nav.Link>
          </LinkContainer>
        </React.Fragment>
      )}
    </Navbar>
  );
};

export default NavBar;
