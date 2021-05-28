import firebase from "firebase/app";

import { useState, useEffect, useRef } from "react";
import { store } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
    Container,
    Alert,
    Button,
    Row,
    Col,
    Tab,
    Nav,
    Collapse,
    InputGroup,
    FormControl,
    Form,
} from "react-bootstrap";

import PageHeader from "./PageHeader";

export default function Teams() {
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState([]);

    const [joinOpen, setJoinOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

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
            return <h2>You are currently not in any team right now.</h2>;
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
                                            <h2>{g.name}</h2>
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

    function joinToggle() {
        if (!joinOpen && createOpen) {
            setCreateOpen(false);
        }
        setJoinOpen(!joinOpen);
    }

    function createToggle() {
        if (!createOpen && joinOpen) {
            setJoinOpen(false);
        }
        setCreateOpen(!createOpen);
    }

    const [error, setError] = useState("");
    const joinGroupIdRef = useRef();
    const groupNameRef = useRef();
    const groupIdRef = useRef();
    const groupDescRef = useRef();
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState();

    async function joinGroup() {
        setError("");
        setLoading(true);

        let existing = false;
        let group = null;

        // Get the group
        await store
            .collection("groups")
            .where("id", "==", joinOpen ? joinGroupIdRef.current.value : groupIdRef.current.value)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    existing = true;
                    group = querySnapshot.docs[0];
                }
            });

        // Check if group exists
        if (!existing) {
            setError("No group with such ID was found.");
            setLoading(false);
            return;
        }

        await store
            .collection("groups")
            .doc(group.id)
            .update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
            });

        await store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                groups: firebase.firestore.FieldValue.arrayUnion(group.id),
            });

        getGroups();
        setLoading(false);
    }

    function nameChange() {
        setGroupId(
            groupNameRef.current.value
                .replace(/[^\w\s]/gi, "")
                .replace(/\s+/g, "-")
                .toLowerCase()
        );
    }

    async function createGroup(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        let existing = false;

        await store
            .collection("groups")
            .where("id", "==", groupIdRef.current.value)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    existing = true;
                }
            });

        if (existing) {
            setError("A team with this ID already exists. Try another one.");
            setLoading(false);
            return;
        }

        const newGroup = {
            id: groupIdRef.current.value,
            name: groupNameRef.current.value,
            desc: groupDescRef.current.value,
            members: [],
        };

        store
            .collection("groups")
            .add(newGroup)
            .then(() => {
                joinGroup(groupIdRef.current.value);
            })
            .catch((e) => {
                setError("Failed to create new group.");
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
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Teams</h1>
                        <p>
                            You can choose to be part of any number of teams! You will be subscribed
                            to all the events that are ongoing in the teams you are part of.
                        </p>
                        <Button onClick={joinToggle} variant="danger" size="lg">
                            Join a Team
                        </Button>
                        <Button
                            onClick={createToggle}
                            variant="outline-danger"
                            size="lg"
                            className="mx-3"
                        >
                            Create a new Team
                        </Button>
                        <Collapse in={joinOpen}>
                            <div>
                                <Container className="mt-5 col-8" stlye={{ maxWidth: "300px" }}>
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            type="text"
                                            ref={joinGroupIdRef}
                                            placeholder="Team ID"
                                        />
                                        <Button variant="outline-success" onClick={joinGroup}>
                                            Join
                                        </Button>
                                    </InputGroup>
                                </Container>
                            </div>
                        </Collapse>
                        <Collapse in={createOpen}>
                            <div>
                                <Container className="mt-5 col-8" stlye={{ maxWidth: "300px" }}>
                                    <Form onSubmit={createGroup}>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">
                                                Team Name
                                            </Form.Label>
                                            <Col sm="10">
                                                <Form.Control
                                                    type="text"
                                                    ref={groupNameRef}
                                                    onChange={nameChange}
                                                    required
                                                />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">
                                                Team ID
                                            </Form.Label>
                                            <Col sm="10">
                                                <Form.Control
                                                    ref={groupIdRef}
                                                    value={groupId}
                                                    readOnly
                                                    required
                                                />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">
                                                Description
                                            </Form.Label>
                                            <Col sm="10">
                                                <Form.Control
                                                    as="textarea"
                                                    ref={groupDescRef}
                                                    required
                                                />
                                            </Col>
                                        </Form.Group>
                                        <Button disabled={loading} className="w-100" type="submit">
                                            Create
                                        </Button>
                                    </Form>
                                </Container>
                            </div>
                        </Collapse>
                    </Container>
                    <Container className="col-sm-12 mx-auto mt-5 p-5">{renderGroups()}</Container>
                </Container>
            </Container>
        </>
    );
}
