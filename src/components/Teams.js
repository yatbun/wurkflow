import { useState, useEffect } from "react";
import { store } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Alert, Button, Row, Col, Tab, Nav } from "react-bootstrap";

import PageHeader from "./PageHeader";

export default function Teams() {
    const [error, setError] = useState("");
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState([]);

    function getGroups() {
        const promises = [];
        const grps = [];
        store
            .collection("users")
            .doc(currentUser.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    doc.data().groups.map((group) => {
                        promises.push(
                            store
                                .collection("groups")
                                .doc(group)
                                .get()
                                .then((g) => {
                                    grps.push(g.data());
                                })
                        );
                    });
                }
            })
            .finally(() => {
                Promise.all(promises).then(() => {
                    setGroups(grps);
                });
            });
    }

    useEffect(() => {
        getGroups();
    }, []);

    const renderGroups = () => {
        if (groups.length == 0) {
            return <h2>You are currently not in any teams right now.</h2>;
        } else {
            return (
                <>
                    <h2>Teams you are part of</h2>
                    <Tab.Container defaultActiveKey={groups[0].id}>
                        <Row className="mt-5">
                            <Col sm={2}>
                                <Nav variant="pills" className="flex-column">
                                    {groups.map((g) => (
                                        <Nav.Item key={g.id}>
                                            <Nav.Link eventKey={g.id}>{g.name}</Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Col>
                            <Col sm={10}>
                                <Tab.Content className="p-2 bg-light rounded border">
                                    {groups.map((g) => (
                                        <Tab.Pane key={g.id} eventKey={g.id}>
                                            <p>{g.desc}</p>
                                        </Tab.Pane>
                                    ))}
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </>
            );
        }
    };
    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Teams</h1>
                        <p>
                            You can choose to be part of any number of teams! You will be subscribed
                            to all the events that are ongoing in the teams you are part of.
                        </p>
                        <Button variant="danger" size="lg">
                            Join a Team!
                        </Button>
                    </Container>
                    <Container className="col-sm-12 mx-auto mt-5 p-5">{renderGroups()}</Container>
                </Container>
            </Container>
        </>
    );
}
