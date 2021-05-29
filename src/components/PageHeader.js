import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

import logo from "../img/logo.png";

import { Navbar, Nav, Container, Image, Dropdown } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";

export default function PageHeader() {
    const { currentUser, logout } = useAuth();
    const [error, setError] = useState("");
    const history = useHistory();

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
                    <Link to="/" className="nav-link px-2 link-dark">
                        Home
                    </Link>

                    {currentUser && (
                        <>
                            <Link to="/tasks" className="nav-link px-2 link-dark">
                                Tasks
                            </Link>
                            <Link to="/teams" className="nav-link px-2 link-dark">
                                Teams
                            </Link>
                            <Link to="/workflows" className="nav-link px-2 link-dark disabled">
                                Workflows
                            </Link>
                        </>
                    )}

                    <Link to="/" className="nav-link px-2 link-dark disabled">
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
                                <Link to="/update-profile" className="dropdown-item">
                                    Update Profile
                                </Link>
                                <Dropdown.Item>Settings</Dropdown.Item>
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
