// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";

// Styling imports
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";

// Page component imports
import PageHeader from "./PageHeader";

/**
 * @classdesc
 * The update profile page.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function UpdateProfile() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentUser, updateName, updateEmail, updatePassword } = useAuth();
    const history = useHistory();

    // useState declarations
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------------
    // UPDATE PROFILE FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    // ------------------------------------------------------------------------

    /**
     * Handles the updating of the current user profile.
     *
     * @param {Event} e The `onClick` event of the Update Profile button
     */
    function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            setError("Passwords do not match.");
        }

        const promises = [];
        setLoading(true);
        setError("");

        if (nameRef.current.value !== currentUser.displayName) {
            promises.push(updateName(nameRef.current.value));
        }
        if (emailRef.current.value !== currentUser.email) {
            promises.push(updateEmail(emailRef.current.value));
        }
        if (passwordRef.current.value) {
            promises.push(updatePassword(passwordRef.current.value));
        }

        Promise.all(promises)
            .then(() => {
                history.push("/");
            })
            .catch((e) => {
                setError("Failed to update account. " + e.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex align-items-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>Update Profile</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="displayName" className="mt-4">
                                <Form.Label>Display Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={nameRef}
                                    required
                                    defaultValue={currentUser.displayName}
                                />
                            </Form.Group>
                            <Form.Group id="email" className="mt-4">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    ref={emailRef}
                                    required
                                    defaultValue={currentUser.email}
                                />
                            </Form.Group>

                            <Form.Group id="password" className="mt-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    ref={passwordRef}
                                    placeholder="Leave blank to keep unchanged"
                                />
                            </Form.Group>

                            <Form.Group id="password-confirm" className="mt-4">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    ref={passwordConfirmRef}
                                    placeholder="Leave blank to keep unchanged"
                                />
                            </Form.Group>
                            <Button
                                disabled={loading}
                                className="w-100 mt-4"
                                type="submit"
                            >
                                Update
                            </Button>
                        </Form>
                    </Card>
                </Container>
            </Container>
        </>
    );
}

export default UpdateProfile;
