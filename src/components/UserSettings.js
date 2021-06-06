import { useRef, useEffect } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useStore } from "../contexts/StoreContext";
import { useHistory } from "react-router-dom";

import PageHeader from "./PageHeader";

export default function UserSettings() {
    const { userData, orgs, updateCurrentOrg } = useStore();
    const orgsRef = useRef();
    const history = useHistory();

    // Sets the value of the selector to the current organisation
    function updateSelect() {
        if (userData) {
            userData.currentOrg.get().then((doc) => {
                orgsRef.current.value = doc.data().name;
            });
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Get the unique ID of the selected organisation
        const oid = orgs.filter((o) => {
            return o.name === orgsRef.current.value;
        })[0].uid;

        updateCurrentOrg(oid);

        history.push("/");
    }

    useEffect(() => {
        updateSelect();
    }, []);

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex align-items-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>User Settings</Card.Title>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mt-4">
                                <Form.Label>Current Organisation: </Form.Label>
                                <Form.Control as="select" ref={orgsRef} className="form-select">
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
