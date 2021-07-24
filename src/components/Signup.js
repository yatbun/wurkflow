// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";

// Styling imports
import {
    Form,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Card,
    Alert,
    Container,
} from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The sign up page.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Signup() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { signup, signupMakeAdmin } = useAuth();
    const { orgExistsFromUid, orgExistsFromId, createOrg } = useStore();
    const history = useHistory();

    // useState declarations
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------------
    // SIGN UP FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const orgRef = useRef();
    const [radioValue, setRadioValue] = useState(1);
    // ------------------------------------------------------------------------

    /**
     * Updates `radioValue` state on toggle.
     * @param {Number} val The selected toggle option
     * @returns {void}
     */
    const radioToggle = (val) => setRadioValue(val);

    /**
     * Converts an organisation name to its unique ID.
     *
     * @param {string} name Organisation name to convert
     * @returns {string} The unique ID of the organisation
     */
    function nameToId(name) {
        return name
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-")
            .toLowerCase();
    }

    /**
     * Handles the signing up of users.
     *
     * @param {Event} e The `onClick` event of the Sign Up button
     * @returns {void}
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Check if the password fields match
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }

        if (radioValue === 1) {
            // Trying to join an org, so check for its existence
            orgExistsFromUid(orgRef.current.value).then(async (res) => {
                if (res) {
                    try {
                        await signup(
                            nameRef.current.value,
                            emailRef.current.value,
                            passwordRef.current.value,
                            orgRef.current.value
                        );
                        history.push("/");
                    } catch (e) {
                        setError("Failed to create an account. " + e.message);
                    }
                } else {
                    return setError("The organisation does not exist.");
                }
            });
        } else {
            // Trying to make a new org, so check if it exists already
            orgExistsFromId(nameToId(orgRef.current.value)).then((res) => {
                if (res) {
                    // Org already exists
                    return setError(
                        "An organisation with this name already exists. Try another one."
                    );
                } else {
                    // Create the org and account
                    createOrg(
                        nameToId(orgRef.current.value),
                        orgRef.current.value
                    ).then(async (r) => {
                        try {
                            await signupMakeAdmin(
                                nameRef.current.value,
                                emailRef.current.value,
                                passwordRef.current.value,
                                r
                            );
                            history.push("/");
                        } catch (e) {
                            setError(
                                "Failed to create an account. " + e.message
                            );
                        }
                    });
                }
            });
        }
        setLoading(false);
    }

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex align-items-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>Sign Up</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="name" className="mt-4">
                                <Form.Label>Display Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={nameRef}
                                    required
                                />
                            </Form.Group>

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

                            <Form.Group id="password-confirm" className="mt-4">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    ref={passwordConfirmRef}
                                    required
                                />
                            </Form.Group>

                            <Form.Group id="admin-select" className="mt-4">
                                <Form.Label>I am a</Form.Label>
                                <br />
                                <ToggleButtonGroup
                                    type="radio"
                                    value={radioValue}
                                    onChange={radioToggle}
                                    name="orgRadio"
                                >
                                    <ToggleButton value={1}>
                                        Organisation Member
                                    </ToggleButton>
                                    <ToggleButton value={2}>
                                        Organisation Leader
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Form.Group>

                            <Form.Group id="org-info" className="mt-4">
                                <Form.Control
                                    type="text"
                                    ref={orgRef}
                                    required
                                    placeholder={
                                        radioValue === 1
                                            ? "Organisation Code"
                                            : "Organisation Name"
                                    }
                                />
                            </Form.Group>

                            <Button
                                disabled={loading}
                                className="w-100 mt-4"
                                type="submit"
                            >
                                Sign Up
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            Already have an account?{" "}
                            <Link to="/login">Log In</Link>.
                        </div>
                    </Card>
                </Container>
            </Container>
        </>
    );
}

export default Signup;
