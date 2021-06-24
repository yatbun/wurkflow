// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";

// Styling imports
import {
    Container,
    Form,
    Button,
    CardGroup,
    Card,
    Alert,
} from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";

// Page component imports
import PageHeader from "./PageHeader";

/**
 * @classdesc
 * The login page.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Login() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { login } = useAuth();
    const history = useHistory();

    // useState declarations
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------------
    // LOG IN FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const emailRef = useRef();
    const passwordRef = useRef();
    // ------------------------------------------------------------------------

    /**
     * Handles the logging in of the user.
     *
     * @param {Event} e The `onClick` event from the login button
     */
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            history.push("/");
        } catch {
            setError("Failed to log in. Check your email and password.");
        }
        setLoading(false);
    }

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}

                <Container className="d-flex align-items-center justify-content-center">
                    <CardGroup>
                        <Card
                            className="d-flex p-4"
                            style={{ minWidth: "300px" }}
                        >
                            <Card.Title className="mb-4">Sign Up</Card.Title>
                            <Card.Text>
                                Don't have an account on Wurkflow yet? Get one
                                today and start speeding up your workflows!
                            </Card.Text>
                            <Link to="/signup">
                                <button className="btn btn-outline-secondary">
                                    Sign Up
                                </button>
                            </Link>
                        </Card>

                        <Card className="p-4" style={{ minWidth: "400px" }}>
                            <Card.Title>Log In</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email" className="mt-4">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        ref={emailRef}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group id="password" className="mt-4">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        ref={passwordRef}
                                        required
                                    />
                                </Form.Group>
                                <Button
                                    disabled={loading}
                                    className="w-100 mt-4"
                                    type="submit"
                                >
                                    Log In
                                </Button>
                            </Form>
                            <div className="w-100 text-center mt-3">
                                <Link to="/forgot-password">
                                    Forgot Password?
                                </Link>
                            </div>
                        </Card>
                    </CardGroup>
                </Container>
            </Container>
        </>
    );
}

export default Login;
