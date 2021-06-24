// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

// Styling imports
import { Form, Button, Card, Alert, Container } from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";

// Page component imports
import PageHeader from "./PageHeader";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The forgot password page.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function ForgotPassword() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { resetPassword } = useAuth();

    // useRef declarations
    const emailRef = useRef();

    // useState declarations
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    // ------------------------------------------------------------------------

    /**
     * Calls the `resetPassword` method from `AuthContext`.
     *
     * @param {Event} e The `onClick` event from the reset button
     * @returns {void}
     */
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage("");
            setError("");
            setLoading(true);

            await resetPassword(emailRef.current.value);
            setMessage("Check your inbox for further instructions.");
        } catch (e) {
            setError(e.message);
        }

        setLoading(false);
    }
    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Container className="d-flex align-item-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>Reset Password</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email" className="mt-4">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    ref={emailRef}
                                    required
                                />
                            </Form.Group>
                            <Button
                                disabled={loading}
                                className="w-100 mt-4"
                                type="submit"
                            >
                                Reset Password
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            <Link to="/login">Log In</Link>
                        </div>
                    </Card>
                </Container>
            </Container>
        </>
    );
}

export default ForgotPassword;
