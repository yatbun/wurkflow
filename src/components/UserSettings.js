// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// Styling imports
import { Container, Alert, Card, Form, Button } from "react-bootstrap";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The user settings page.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function UserSettings() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentOrg, orgs, updateCurrentOrg, orgExistsFromUid, joinOrg } =
        useStore();
    const history = useHistory();

    // useState declarations
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ------------------------------------------------------------------------
    // USER SETTINGS FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const joinRef = useRef();
    const orgsRef = useRef();
    // ------------------------------------------------------------------------

    /**
     * Handles joining of organisation.
     *
     * @param {Event} e The `onClick` event of the Join button
     */
    async function handleJoin(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        // Check if organisation exists
        const res = await orgExistsFromUid(joinRef.current.value);
        if (res) {
            await joinOrg(joinRef.current.value);

            history.push("/");
        } else {
            setError("No organisation with such code exists.");
        }
    }

    /**
     * Handles changing of current active organisation.
     *
     * @param {Event} e The `onClick` event of the Change button
     */
    function handleChange(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        // Get the unique ID of the selected organisation
        const ouid = orgs.filter((o) => {
            return o.name === orgsRef.current.value;
        })[0].uid;

        try {
            updateCurrentOrg(ouid);
        } catch {
            setError("Failed to change current organisation. Try again.");
        }

        history.push("/");
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Sets the current active organisation as the default value in the
    // organisation picker.
    useEffect(() => {
        if (currentOrg) {
            orgsRef.current.value = currentOrg.name;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex align-items-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>User Settings</Card.Title>

                        <Form onSubmit={handleJoin}>
                            <Form.Group className="mt-4">
                                <Form.Label>Join Organisation:</Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={joinRef}
                                    placeholder="Organisation Code"
                                    required
                                />
                            </Form.Group>
                            <Button className="w-100 mt-4" type="submit">
                                Join
                            </Button>
                        </Form>

                        <Form onSubmit={handleChange}>
                            <Form.Group className="mt-4">
                                <Form.Label>Current Organisation: </Form.Label>
                                <Form.Control
                                    as="select"
                                    ref={orgsRef}
                                    className="form-select"
                                >
                                    {orgs.map((o) => (
                                        <option key={o.uid}>{o.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Button className="w-100 mt-4" type="submit">
                                Set
                            </Button>
                        </Form>
                    </Card>
                </Container>
            </Container>
        </>
    );
}

export default UserSettings;
