import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

import logo from "../img/logo.png";

import { Navbar, Nav, Container, Image } from "react-bootstrap";
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
        <Navbar fixed="top" bg="white" className="pl-3 border-bottom">
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

                    <Link to="/" className="nav-link px-2 link-dark">
                        About
                    </Link>
                </Nav>

                {currentUser ? (
                    <>
                        <button className="btn btn-outline-success" onClick={handleLogout}>
                            Log Out of {currentUser.email}
                        </button>
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
