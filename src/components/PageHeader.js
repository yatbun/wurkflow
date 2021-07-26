// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

// Styling imports
import {
    Navbar,
    Nav,
    NavDropdown,
    Container,
    Image,
    Dropdown,
} from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import logo from "../img/logo.png";

/**
 * @classdesc
 * The navigation bar.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function PageHeader() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentUser, logout } = useAuth();
    const { userData } = useStore();
    const history = useHistory();

    // useState declarations
    const [error, setError] = useState("");
    // ------------------------------------------------------------------------

    /**
     * Handles the logging out of the user.
     *
     * @returns {void}
     */
    async function handleLogout() {
        setError("");

        try {
            await logout();
            history.push("/");
        } catch {
            setError("Failed to log out");
        }
    }

    /**
     * Render function for the logged in section of the navigation bar.
     *
     * @returns {Component} The logged in section of the navigation bar.
     */
    const loggedInMenu = () => {
        return (
            <>
                <LinkContainer to="/workflows">
                    <Nav.Link eventKey={2}>Workflows</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/tasks">
                    <Nav.Link eventKey={3}>Tasks</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Manage" id="nav-dropdown">
                    {userData && userData.orgAdmin && (
                        <LinkContainer to="/manage-organisation">
                            <NavDropdown.Item eventKey={4.1}>
                                My Organisation
                            </NavDropdown.Item>
                        </LinkContainer>
                    )}
                    <LinkContainer to="/teams">
                        <NavDropdown.Item eventKey={4.2}>
                            My Teams
                        </NavDropdown.Item>
                    </LinkContainer>
                </NavDropdown>
            </>
        );
    };

    return (
        <Navbar fixed="top" bg="white" className="pl-3 border-bottom shadow-sm">
            <Container>
                <Navbar.Brand>
                    <Link to="/">
                        <Image src={logo} width="187" height="25" />
                    </Link>
                </Navbar.Brand>

                <Nav className="mx-auto">
                    <LinkContainer to="/home">
                        <Nav.Link eventKey={1}> Home</Nav.Link>
                    </LinkContainer>

                    {currentUser && loggedInMenu()}
                </Nav>

                {currentUser ? (
                    <>
                        <Dropdown alignRight={true}>
                            <Dropdown.Toggle
                                variant="outline-success"
                                id="dd-profile"
                            >
                                {currentUser.displayName}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Link
                                    to="/user-settings"
                                    className="dropdown-item"
                                >
                                    User Settings
                                </Link>
                                <Link
                                    to="/update-profile"
                                    className="dropdown-item"
                                >
                                    Update Profile
                                </Link>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ) : (
                    <Link to="/login">
                        <button className="btn btn-outline-danger">
                            Get Started
                        </button>
                    </Link>
                )}
            </Container>
        </Navbar>
    );
}

export default PageHeader;
