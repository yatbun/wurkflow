import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

import logo from "../img/logo.png";

import { Navbar, Nav, Container, Image, Dropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useHistory } from "react-router-dom";

export default function PageHeader() {
    const { currentUser, logout } = useAuth();
    const history = useHistory();

    const [error, setError] = useState("");

    async function handleLogout() {
        setError("");

        try {
            await logout();
            history.push("/");
        } catch {
            setError("Failed to log out");
        }
    }

    return (
        <Navbar fixed="top" bg="white" className="pl-3 border-bottom shadow-sm">
            <Container>
                <Navbar.Brand>
                    <Link to="/">
                        <Image src={logo} width="187" height="25" />
                    </Link>
                </Navbar.Brand>

                <Nav className="mr-auto">
                    <LinkContainer to="/home">
                        <Nav.Link eventKey={1}> Home</Nav.Link>
                    </LinkContainer>

                    {currentUser && (
                        <>
                            <LinkContainer to="/tasks">
                                <Nav.Link eventKey={2}>Tasks</Nav.Link>
                            </LinkContainer>

                            <LinkContainer to="/teams">
                                <Nav.Link eventKey={3}>Teams</Nav.Link>
                            </LinkContainer>

                            <LinkContainer to="/workflows">
                                <Nav.Link eventKey={4} disabled>
                                    Workflows
                                </Nav.Link>
                            </LinkContainer>
                        </>
                    )}

                    <Link to="/" className="nav-link px-2 disabled">
                        About
                    </Link>
                </Nav>

                {currentUser ? (
                    <>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dd-profile">
                                {currentUser.displayName}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Link to="/user-settings" className="dropdown-item">
                                    User Settings
                                </Link>
                                <Link to="/update-profile" className="dropdown-item">
                                    Update Profile
                                </Link>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ) : (
                    <Link to="/login">
                        <button className="btn btn-outline-danger">Get Started</button>
                    </Link>
                )}
            </Container>
        </Navbar>
    );
}
