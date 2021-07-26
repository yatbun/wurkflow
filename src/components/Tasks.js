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
    Collapse,
    Form,
    Row,
    Col,
} from "react-bootstrap";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
import DropdownList from "react-widgets/DropdownList";
import Multiselect from "react-widgets/Multiselect";
import Localization from "react-widgets/esm/Localization";
import DatePicker from "react-widgets/DatePicker";
import TaskTableView from "./TaskTableView";

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
    const { teams, tasks, completedTasks, createTask, getTeamUsers } =
        useStore();

    // useState declarations
    const [showCreate, setShowCreate] = useState(false);
    const [showCompletedTasks, setShowCompletedTasks] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

                    <Container className="col-sm-12 mx-auto mt-2 mb-5 pt-5">
                        {tasks && tasks.length === 0 ? (
                            <h2>You do not have any active tasks right now.</h2>
                        ) : (
                            <>
                                <h2>Your tasks</h2>
                                <TaskTableView tasks={tasks} />
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
                                    <TaskTableView tasks={completedTasks} />
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
