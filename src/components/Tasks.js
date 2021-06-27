// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Styling imports
import {
    Container,
    Alert,
    Button,
    Collapse,
    Form,
    Row,
    Col,
    Table,
    OverlayTrigger,
    Tooltip,
    Modal,
} from "react-bootstrap";
import { FaEye, FaCheck, FaTrash, FaExclamationTriangle } from "react-icons/fa";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
import DropdownList from "react-widgets/DropdownList";
import Multiselect from "react-widgets/Multiselect";
import Localization from "react-widgets/esm/Localization";
import DatePicker from "react-widgets/DatePicker";

// Misc imports
import { DateLocalizer } from "react-widgets/IntlLocalizer";

/**
 * @classdesc
 * Page to display and create tasks.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Tasks() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const {
        teams,
        tasks,
        completedTasks,
        createTask,
        deleteTask,
        completeTask,
        getTeamUsers,
    } = useStore();

    // useState declarations
    const [showCreate, setShowCreate] = useState(false);
    const [showCompletedTasks, setShowCompletedTasks] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [action, setAction] = useState("");
    const [actionTask, setActionTask] = useState("");
    const [showModal, setShowModal] = useState(false);

    // ------------------------------------------------------------------------
    // NEW TASK FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const taskNameRef = useRef();
    const taskDescRef = useRef();
    const [taskTeam, setTaskTeam] = useState(null);
    const [teamUsers, setTeamUsers] = useState([]);
    const [taskDate, setTaskDate] = useState(new Date());
    const [selectedUsers, setSelectedUsers] = useState([]);
    // ------------------------------------------------------------------------

    /**
     * Checks the current modal action and assigns it to `actionTask` for use
     * by the `Modal`.
     *
     * @returns {void}
     */
    function modalAction() {
        if (action === "delete") {
            deleteTask(actionTask);
        } else if (action === "complete") {
            completeTask(actionTask);
        }
        closeModal();
    }

    /**
     * Handles the opening of the `Modal`.
     *
     * @param {String} taskUid The unique document id of the Task
     * @param {String} action The desired action to be applied to the Task
     *
     * @returns {void}
     */
    function openModal(taskUid, action) {
        setAction(action);
        setActionTask(taskUid);
        setShowModal(true);
    }

    /**
     * Handles the closing of the `Modal`.
     *
     * @returns {void}
     */
    function closeModal() {
        setAction("");
        setActionTask("");
        setShowModal(false);
    }

    /**
     * The render function to display the user's task in the form of a table
     *
     * @param {Object[]} t Array of user's tasks
     * @returns {Component} A table interface for the display of the user's
     * tasks
     */
    const renderTasks = (t) => {
        return (
            <Table striped bordered hover responsive className="mt-3">
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Date Due</th>
                        <th>Team</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {t.map((task, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{task.name}</td>
                            <td>{task.desc}</td>
                            <td>{task.dueDate.toLocaleDateString("en-GB")}</td>
                            <td>{task.teamName}</td>
                            <td>
                                <OverlayTrigger
                                    overlay={<Tooltip>View</Tooltip>}
                                >
                                    <span className="d-inline-block me-md-2 my-1">
                                        <Link to={`/task/${task.uid}`}>
                                            <Button variant="primary" size="sm">
                                                <FaEye />
                                            </Button>
                                        </Link>
                                    </span>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    overlay={
                                        task.completed ? (
                                            <Tooltip>
                                                Task has already been marked as
                                                completed
                                            </Tooltip>
                                        ) : (
                                            <Tooltip>Complete</Tooltip>
                                        )
                                    }
                                >
                                    <span className="d-inline-block me-md-2 my-1">
                                        <Button
                                            onClick={() =>
                                                openModal(task.uid, "complete")
                                            }
                                            variant="success"
                                            size="sm"
                                            disabled={task.completed}
                                        >
                                            <FaCheck />
                                        </Button>
                                    </span>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    overlay={<Tooltip>Delete</Tooltip>}
                                >
                                    <span className="d-inline-block my-1">
                                        <Button
                                            onClick={() =>
                                                openModal(task.uid, "delete")
                                            }
                                            variant="danger"
                                            size="sm"
                                            disabled={task.workflow}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </span>
                                </OverlayTrigger>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    /**
     * Gets the list of users within the selected team.
     *
     * @returns {void}
     */
    async function handleTeamChange() {
        if (taskTeam) {
            setTeamUsers(await getTeamUsers(taskTeam.uid));
        }
    }

    /**
     * Selective renderer for the users `Multiselect`.
     *
     * @returns {Component} The `Multiselect` only if a team is selected
     */
    function renderMultiSelect() {
        if (teamUsers.length === 0) {
            return <div className="my-2">Please select a team</div>;
        } else {
            return (
                <Multiselect
                    data={teamUsers}
                    textField="name"
                    onChange={(val) => setSelectedUsers(val)}
                />
            );
        }
    }

    /**
     * Handles the creation of a new task from the information entered by the
     * user in the New Task form.
     *
     * @param {Event} e The `onClick` event from the Create button
     */
    function handleCreate(e) {
        e.preventDefault();

        const tuid = taskTeam.uid;

        createTask(
            taskNameRef.current.value,
            selectedUsers.map((user) => user.uid),
            taskDescRef.current.value,
            tuid,
            taskDate
        );

        taskNameRef.current.value = "";
        taskDescRef.current.value = "";
        setTaskDate(new Date());
        setShowCreate(false);
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Updates the the users in the `Multiselect` if the selected team is
    // changed.
    useEffect(() => {
        handleTeamChange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskTeam]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Tasks</h1>
                        <p>
                            Tasks are events that have been scheduled within the
                            Teams that you are subcribed to.
                        </p>
                        <Button
                            onClick={() => setShowCreate(!showCreate)}
                            variant="danger"
                            size="lg"
                        >
                            Create a Task
                        </Button>
                        <Button
                            onClick={() =>
                                setShowCompletedTasks(!showCompletedTasks)
                            }
                            variant="outline-secondary"
                            size="lg"
                            className="mx-3"
                        >
                            {showCompletedTasks
                                ? "Hide Completed"
                                : "Show Completed"}
                        </Button>
                        <Collapse in={showCreate}>
                            <div>
                                <Container
                                    className="mt-5 col-10"
                                    style={{ maxWidth: "600px" }}
                                >
                                    <Localization
                                        date={
                                            new DateLocalizer({
                                                culture: "en-GB",
                                                firstOfWeek: 7,
                                            })
                                        }
                                    >
                                        <Form onSubmit={handleCreate}>
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                            >
                                                <Form.Label column sm="3">
                                                    Task Name
                                                </Form.Label>
                                                <Col sm="9">
                                                    <Form.Control
                                                        type="text"
                                                        ref={taskNameRef}
                                                        required
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                            >
                                                <Form.Label column sm="3">
                                                    Task Description
                                                </Form.Label>
                                                <Col sm="9">
                                                    <Form.Control
                                                        as="textarea"
                                                        ref={taskDescRef}
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                            >
                                                <Form.Label column sm="3">
                                                    Team Involved
                                                </Form.Label>
                                                <Col sm="9">
                                                    <DropdownList
                                                        defaultValue="Select a team"
                                                        data={teams}
                                                        textField="name"
                                                        value={taskTeam}
                                                        onChange={(val) =>
                                                            setTaskTeam(val)
                                                        }
                                                        disabled={
                                                            taskTeam !== null
                                                        }
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group
                                                as={Row}
                                                controlId="my_multiselect_field"
                                                className="mb-3"
                                            >
                                                <Form.Label column sm="3">
                                                    Users Involved
                                                </Form.Label>
                                                <Col sm="9">
                                                    {renderMultiSelect()}
                                                </Col>
                                            </Form.Group>

                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                            >
                                                <Form.Label column sm="3">
                                                    Date Due
                                                </Form.Label>
                                                <Col sm="9">
                                                    <DatePicker
                                                        value={taskDate}
                                                        onChange={(date) =>
                                                            setTaskDate(date)
                                                        }
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Button
                                                disabled={loading}
                                                className="w-100"
                                                type="submit"
                                            >
                                                Create
                                            </Button>
                                        </Form>
                                    </Localization>
                                </Container>
                            </div>
                        </Collapse>
                    </Container>

                    <Modal show={showModal} onHide={closeModal}>
                        <Modal.Header>
                            <Modal.Title>
                                <FaExclamationTriangle />
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button variant="warning" onClick={modalAction}>
                                I AM SURE
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Container className="col-sm-12 mx-auto mt-2 mb-5 pt-5">
                        {tasks && tasks.length === 0 ? (
                            <h2>You do not have any active tasks right now.</h2>
                        ) : (
                            <>
                                <h2>Your tasks</h2>
                                {renderTasks(tasks)}
                            </>
                        )}
                    </Container>

                    <Collapse in={showCompletedTasks}>
                        <Container className="col-sm-12 mx-auto mt-2 mb-5 pt-5">
                            {completedTasks && completedTasks.length === 0 ? (
                                <h2>You do not have any completed tasks.</h2>
                            ) : (
                                <>
                                    <h2>Your completed tasks</h2>
                                    {renderTasks(completedTasks)}
                                </>
                            )}
                        </Container>
                    </Collapse>
                </Container>
            </Container>
        </>
    );
}

export default Tasks;
