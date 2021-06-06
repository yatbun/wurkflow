import { useRef, useEffect } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useStore } from "../contexts/StoreContext";
import { useHistory } from "react-router-dom";

import PageHeader from "./PageHeader";

export default function UserSettings() {
    const { currentOrg, orgs, updateCurrentOrg } = useStore();
    const orgsRef = useRef();
    const history = useHistory();

    function handleSubmit(e) {
        e.preventDefault();

        // Get the unique ID of the selected organisation
        const ouid = orgs.filter((o) => {
            return o.name === orgsRef.current.value;
        })[0].uid;

        updateCurrentOrg(ouid);

        history.push("/");
    }

    useEffect(() => {
        orgsRef.current.value = currentOrg.name;
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
