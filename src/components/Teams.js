// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useRef, useEffect } from "react";

// Styling imports
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
import { FaExclamationTriangle } from "react-icons/fa";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";

/**
 * @classdesc
 * Page to manage user's teams.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Teams() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const {
        currentOrg,
        teams,
        teamsMessage,
        teamsError,
        quitTeam,
        joinTeam,
        createTeam,
    } = useStore();

    // useState declarations
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ------------------------------------------------------------------------
    // TEAM QUITTING FORM DECLARATIONS
    // ------------------------------------------------------------------------

    const [teamQuit, setTeamQuit] = useState("");
    const [showModal, setShowModal] = useState(false);

    /**
     * Handles the closing of the quit team `Modal`.
     * @returns {void}
     */
    const closeModal = () => setShowModal(false);

    /**
     * Handles the opening of the quit team `Modal`.
     * @returns {void}
     */
    const openModal = (tuid) => {
        setMessage("");
        setTeamQuit(tuid);
        setShowModal(true);
    };

    /**
     * Handles the quitting of the selected team.
     *
     * @returns {void}
     */
    async function quitHandler() {
        setError("");
        quitTeam(teamQuit);
        setTeamQuit("");
        setShowModal(false);
    }

    // ------------------------------------------------------------------------
    // TEAM JOINING AND CREATING FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const [joinOpen, setJoinOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [currentOrgName, setCurrentOrgName] = useState("");
    const joinGroupIdRef = useRef();
    const groupNameRef = useRef();
    const groupIdRef = useRef();
    const groupDescRef = useRef();
    const [groupId, setGroupId] = useState();

    /**
     * Handles the toggling of the join team form.
     *
     * @returns {void}
     */
    function joinToggle() {
        if (!joinOpen && createOpen) {
            setCreateOpen(false);
        }
        setJoinOpen(!joinOpen);
        setMessage("");
        setError("");
        clearFields();
    }

    /**
     * Handles the toggling of the create team form.
     *
     * @returns {void}
     */
    function createToggle() {
        if (!createOpen && joinOpen) {
            setJoinOpen(false);
        }
        setCreateOpen(!createOpen);
        setMessage("");
        setError("");
        clearFields();
    }
    // ------------------------------------------------------------------------

    /**
     * Render function for the user's teams.
     *
     * @returns {Component} The user's teams `Tab` view interface.
     */
    const renderTeams = () => {
        if (teams && teams.length === 0) {
            return <h2>You are currently not in any team right now.</h2>;
        } else {
            return (
                <>
                    <h2>Teams you are part of</h2>

                    <Modal show={showModal} onHide={closeModal}>
                        <Modal.Header>
                            <Modal.Title>
                                <FaExclamationTriangle />
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to leave this group?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button variant="warning" onClick={quitHandler}>
                                I AM SURE
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Tab.Container defaultActiveKey={teams[0].id}>
                        <Row className="mt-5">
                            <Col sm={3} lg={2} className="border-end">
                                <Nav variant="pills" className="flex-column">
                                    {teams.map((t) => (
                                        <Nav.Item key={t.uid}>
                                            <Nav.Link eventKey={t.id}>
                                                {t.name}
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Col>
                            <Col sm={9} lg={10}>
                                <Tab.Content className="p-5 bg-light rounded border">
                                    {teams.map((t) => (
                                        <Tab.Pane key={t.uid} eventKey={t.id}>
                                            <h2>{t.name}</h2>
                                            <h6>Team ID: {t.id}</h6>

                                            <p className="mt-4">{t.desc}</p>
                                            <Button
                                                variant="warning"
                                                onClick={() => openModal(t.uid)}
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

    /**
     * Clears the form fields
     *
     * @returns {void}
     */
    function clearFields() {
        joinGroupIdRef.current.value = "";
        groupNameRef.current.value = "";
        groupIdRef.current.value = "";
        groupDescRef.current.value = "";
    }

    /**
     * Handles the joining of teams using the team code filled in by the user.
     *
     * @param {Event} e The `onClick` event from the Join button
     */
    async function handleJoin(e) {
        e.preventDefault();

        const temp = joinOpen
            ? joinGroupIdRef.current.value
            : groupIdRef.current.value;
        joinTeam(currentOrgName + "-" + temp);

        clearFields();
        joinToggle();
    }

    function nameChange() {
        setGroupId(
            currentOrgName +
                "-" +
                groupNameRef.current.value
                    .replace(/[^\w\s]/gi, "")
                    .replace(/\s+/g, "-")
                    .toLowerCase()
        );
    }

    /**
     * Handles the creation of new a new team using the information filled in
     * by the user.
     *
     * @param {Event} e The `onClick` event from the Create button
     */
    async function handleCreate(e) {
        e.preventDefault();

        setError("");
        createTeam(
            groupIdRef.current.value,
            groupNameRef.current.value,
            groupDescRef.current.value
        );

        clearFields();
        createToggle();
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Sets the current organisation name on page load.
    useEffect(() => {
        if (currentOrg) {
            setCurrentOrgName(currentOrg.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Updates the current organisation name if `currentOrg` were to change.
    useEffect(() => {
        if (currentOrg) {
            setCurrentOrgName(currentOrg.id);
        }
    }, [currentOrg]);

    // Retrieves success messages from `teamsMessage` from `StoreContext` and
    // displays them.
    useEffect(() => {
        setMessage(teamsMessage);
    }, [teamsMessage]);

    // Retrieves failure warnings from `teamsError` in `StoreContext` and
    // displays them.
    useEffect(() => {
        setError(teamsError);
    }, [teamsError]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Teams</h1>
                        <p>
                            You can choose to be part of any number of teams!
                            You will be subscribed to all the tasks that are
                            ongoing in the teams you are part of.
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
                                    <Form onSubmit={handleJoin}>
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    {currentOrgName + "-"}
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl
                                                type="text"
                                                ref={joinGroupIdRef}
                                                placeholder="Team ID"
                                            />
                                            <Button
                                                variant="outline-success"
                                                type="submit"
                                            >
                                                Join Group!
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Container>
                            </div>
                        </Collapse>
                        <Collapse in={createOpen}>
                            <div>
                                <Container
                                    className="mt-5 col-8"
                                    stlye={{ maxWidth: "300px" }}
                                >
                                    <Form onSubmit={handleCreate}>
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
                                        <Button className="w-100" type="submit">
                                            Create
                                        </Button>
                                    </Form>
                                </Container>
                            </div>
                        </Collapse>
                    </Container>
                    <Container className="col-sm-12 mx-auto mt-2 p-5">
                        {renderTeams()}
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default Teams;
