import { useState, useRef, useEffect } from "react";
import { useStore } from "../contexts/StoreContext";
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
    Modal,
} from "react-bootstrap";

import PageHeader from "./PageHeader";

export default function Teams() {
    const { groups, groupError, quitGroup, joinGroup, createGroup } = useStore();

    const [joinOpen, setJoinOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [delGroup, setDelGroup] = useState("");
    const [showModal, setShowModal] = useState(false);
    const closeModal = () => setShowModal(false);
    const openModal = (group) => {
        setDelGroup(group);
        setShowModal(true);
    };

    useEffect(() => {
        setError(groupError);
    }, [groupError]);

    async function quitTeam() {
        setError("");
        quitGroup(delGroup);
        setShowModal(false);
    }

    const renderGroups = () => {
        if (groups && groups.length === 0) {
            return <h2>You are currently not in any team right now.</h2>;
        } else {
            return (
                <>
                    <h2>Teams you are part of</h2>

                    <Modal show={showModal} onHide={closeModal}>
                        <Modal.Header>
                            <Modal.Title>Confirm</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to leave this group?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button variant="warning" onClick={quitTeam}>
                                I AM SURE
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Tab.Container defaultActiveKey={groups[0].id}>
                        <Row className="mt-5">
                            <Col sm={3} lg={2} className="border-end">
                                <Nav variant="pills" className="flex-column">
                                    {groups.map((g) => (
                                        <Nav.Item key={g.id}>
                                            <Nav.Link eventKey={g.id}>{g.name}</Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Col>
                            <Col sm={9} lg={10}>
                                <Tab.Content className="p-5 bg-light rounded border">
                                    {groups.map((g) => (
                                        <Tab.Pane key={g.id} eventKey={g.id}>
                                            <h2>{g.name}</h2>
                                            <h6>Team ID: {g.id}</h6>

                                            <p className="mt-4">{g.desc}</p>
                                            <Button
                                                variant="warning"
                                                onClick={() => openModal(g.id)}
                                            >
                                                Quit Team
                                            </Button>
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
        setError("");
        clearFields();
    }

    function createToggle() {
        if (!createOpen && joinOpen) {
            setJoinOpen(false);
        }
        setCreateOpen(!createOpen);
        setError("");
        clearFields();
    }

    const [error, setError] = useState("");
    const joinGroupIdRef = useRef();
    const groupNameRef = useRef();
    const groupIdRef = useRef();
    const groupDescRef = useRef();
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState();

    function clearFields() {
        joinGroupIdRef.current.value = "";
        groupNameRef.current.value = "";
        groupIdRef.current.value = "";
        groupDescRef.current.value = "";
    }

    async function joinTeam(e) {
        e.preventDefault();
        setError("");

        await joinGroup(
            joinOpen ? joinGroupIdRef.current.value.toLowerCase() : groupIdRef.current.value
        );
    }

    function nameChange() {
        setGroupId(
            groupNameRef.current.value
                .replace(/[^\w\s]/gi, "")
                .replace(/\s+/g, "-")
                .toLowerCase()
        );
    }

    async function createTeam(e) {
        e.preventDefault();

        setError("");
        await createGroup(
            groupIdRef.current.value,
            groupNameRef.current.value,
            groupDescRef.current.value
        );

        clearFields();
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
                            to all the tasks that are ongoing in the teams you are part of.
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
                                <Container
                                    className="mt-5 col-md-8 col-lg-5"
                                    stlye={{ maxWidth: "300px" }}
                                >
                                    <Form onSubmit={joinTeam}>
                                        <InputGroup className="mb-3">
                                            <FormControl
                                                type="text"
                                                ref={joinGroupIdRef}
                                                placeholder="Team ID"
                                            />
                                            <Button variant="outline-success" type="submit">
                                                Join Group!
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Container>
                            </div>
                        </Collapse>
                        <Collapse in={createOpen}>
                            <div>
                                <Container className="mt-5 col-8" stlye={{ maxWidth: "300px" }}>
                                    <Form onSubmit={createTeam}>
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
                    <Container className="col-sm-12 mx-auto mt-2 p-5">{renderGroups()}</Container>
                </Container>
            </Container>
        </>
    );
}
