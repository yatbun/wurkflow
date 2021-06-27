// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState, useEffect } from "react";

// Styling imports
import {
    Container,
    Alert,
    Form,
    Button,
    ButtonGroup,
    Badge,
    Card,
    Spinner,
} from "react-bootstrap";

// Context imports
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
import DropdownList from "react-widgets/DropdownList";
import Multiselect from "react-widgets/Multiselect";
import Localization from "react-widgets/esm/Localization";
import DatePicker from "react-widgets/DatePicker";
import NumberPicker from "react-widgets/NumberPicker";

// Misc imports
import { differenceInCalendarDays, add, sub } from "date-fns";
import { DateLocalizer } from "react-widgets/IntlLocalizer";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The page for users to create new workflow templates.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function NewWorkflow() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { teams, createWorkflowTemplate } = useStore();

    // useState declarations
    const [error, setError] = useState("");
    const [continued, setContinued] = useState(false);
    const [teamUsers, setTeamUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------------
    // NEW WORKFLOW FORM DECLARATIONS
    // ------------------------------------------------------------------------
    const wfNameRef = useRef();
    const wfDescRef = useRef();
    const [wfDate, setWfDate] = useState(new Date());
    const [wfTeam, setWfTeam] = useState(null);

    const blankTask = {
        name: "",
        desc: "",
        users: [],
        daysBefore: 0,
        dueDate: wfDate,
    };
    const [taskData, setTaskData] = useState([{ ...blankTask }]);

    // ------------------------------------------------------------------------

    /**
     * Gets the list of users belonging to the selected `wfTeam`.
     *
     * @returns {Object[]} Array of users belonging to the selected team in
     * `wfTeam`.
     */
    async function getTeamUsers() {
        if (wfTeam === null) {
            return;
        }

        const tuid = wfTeam.uid;

        const users = [];

        store
            .collection("users")
            .where(
                "teams",
                "array-contains",
                store.collection("teams").doc(tuid)
            )
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((doc) => {
                    const tempUser = doc.data();
                    tempUser.uid = doc.id;
                    users.push(tempUser);
                });
            })
            .finally(() => {
                setTeamUsers(users);
            });
    }

    /**
     * Handles the adding of an event to the workflow template.
     *
     * @param {Event} e The `onClick` event from the Add button.
     * @returns {void}
     */
    function handleAdd(e) {
        e.preventDefault();

        setTaskData([...taskData, { ...blankTask }]);
    }

    /**
     * Handles the removing of an event to the workflow template.
     *
     * @param {Event} e The `onClick` event from the Remove button.
     * @returns {void}
     */
    function handleRemove(e) {
        e.preventDefault();

        if (taskData.length > 1) {
            setTaskData(taskData.slice(0, -1));
        }
    }

    /**
     * Handles when any text fields within tasks are changed.
     *
     * @param {Event} e The `onChange` event from task text fields.
     * @returns {void}
     */
    function handleTaskDataChange(e) {
        const updatedTaskData = [...taskData];
        updatedTaskData[e.target.dataset.idx][e.target.id] = e.target.value;
        setTaskData(updatedTaskData);
    }

    /**
     * Handles when any `DatePicker` value changes within tasks are changed.
     *
     * @param {Event} e The `onChange` event from task `DatePicker`.
     * @returns {void}
     */
    function handleDateChange(idx, date) {
        const dateDiff = differenceInCalendarDays(wfDate, date);

        const updatedTaskData = [...taskData];
        updatedTaskData[idx]["daysBefore"] = dateDiff;
        updatedTaskData[idx]["dueDate"] = date;
        setTaskData(updatedTaskData);
    }

    /**
     * Handles when any `Multiselect` value changes within tasks are changed.
     *
     * @param {Event} e The `onChange` event from task `Multiselect`.
     * @returns {void}
     */
    function handleUsersChange(idx, val) {
        const updatedTaskData = [...taskData];
        updatedTaskData[idx]["users"] = val;
        setTaskData(updatedTaskData);
    }

    /**
     * Handles when the Continue button is clicked. It is used to lock in the
     * team chosen by the user.
     *
     * @returns {void}
     */
    function handleContinue() {
        setError("");

        if (!wfNameRef.current.value || !wfDescRef.current.value || !wfTeam) {
            setError("Please fill in the template settings");
        } else {
            setContinued(true);
        }
    }

    /**
     * Handles the creation of a new workflow template with the filled in
     * information.
     *
     * @param {Event} e The `onClick` event from the Submit button
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        await createWorkflowTemplate(
            wfNameRef.current.value,
            wfDescRef.current.value,
            wfTeam.uid,
            taskData
        );

        setLoading(false);
    }

    /**
     * The render function for the tasks in the workflow template.
     *
     * @returns {Component} The interface for all the tasks in the workflow
     * template.
     */
    const renderWfTasks = () => {
        return (
            <>
                <h2 className="mt-5">
                    Template Tasks{" "}
                    <Badge variant="secondary">
                        {taskData.length === 1
                            ? "1 Task"
                            : taskData.length + " Tasks"}
                    </Badge>
                </h2>

                <ButtonGroup className="mt-4 w-100">
                    <Button
                        variant="outline-primary"
                        onClick={handleAdd}
                        className="w-50"
                    >
                        Add Task
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={handleRemove}
                        className="w-50"
                        disabled={taskData.length <= 1}
                    >
                        Remove Task
                    </Button>
                </ButtonGroup>

                {taskData.map((_, idx) => {
                    const nameId = `name-${idx}`;
                    const descId = `desc-${idx}`;

                    return (
                        <Card key={idx} className="p-4 mt-4">
                            <Card.Title>Task {idx + 1}</Card.Title>
                            <Form.Group>
                                <Form.Label>Task Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name={nameId}
                                    data-idx={idx}
                                    id="name"
                                    value={taskData[idx].name}
                                    onChange={handleTaskDataChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Task Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    row={3}
                                    name={descId}
                                    data-idx={idx}
                                    id="desc"
                                    value={taskData[idx].desc}
                                    onChange={handleTaskDataChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Row>
                                <Container className="w-50">
                                    <Form.Group>
                                        <Form.Label>Task Due Date</Form.Label>
                                        <br />
                                        <DatePicker
                                            value={taskData[idx].dueDate}
                                            min={
                                                idx === 0
                                                    ? new Date(2020, 1, 1, 0, 0)
                                                    : add(
                                                          taskData[idx - 1]
                                                              .dueDate,
                                                          { days: 1 }
                                                      )
                                            }
                                            max={sub(wfDate, { days: 1 })}
                                            valueDisplayFormat={{
                                                dateStyle: "medium",
                                            }}
                                            onChange={(val) => {
                                                handleDateChange(idx, val);
                                            }}
                                        />
                                    </Form.Group>
                                </Container>
                                <Container className="w-50">
                                    <Form.Group>
                                        <Form.Label>Days Due Before</Form.Label>
                                        <NumberPicker
                                            value={taskData[idx].daysBefore}
                                            min={0}
                                            disabled
                                        />
                                    </Form.Group>
                                </Container>
                            </Form.Row>

                            <Form.Group className="mt-4">
                                <Form.Label>Users Involved</Form.Label>
                                <Multiselect
                                    defaultValue={[]}
                                    data={teamUsers}
                                    textField="name"
                                    onChange={(sel) =>
                                        handleUsersChange(idx, sel)
                                    }
                                />
                            </Form.Group>
                        </Card>
                    );
                })}

                <Button type="submit" className="w-100 mt-5" disabled={loading}>
                    Create
                    {loading && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="mx-2"
                        />
                    )}
                </Button>
            </>
        );
    };

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Gets the list of users beloning in the selected team whenever the
    // selected team is changed.
    useEffect(() => {
        getTeamUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wfTeam]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>New Workflow Template</h1>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Maecenas luctus enim tellus. Interdum et
                            malesuada fames ac ante ipsum primis in faucibus.
                        </p>
                    </Container>
                    <Container className="col-sm-8 mx-auto my-5">
                        <Localization
                            date={
                                new DateLocalizer({
                                    culture: "en-GB",
                                    firstOfWeek: 7,
                                })
                            }
                        >
                            <Form onSubmit={handleSubmit}>
                                <h2>Template Settings</h2>

                                <Form.Group className="mt-4">
                                    <Form.Label>Workflow Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        ref={wfNameRef}
                                        disabled={continued}
                                    />
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>
                                        Workflow Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        ref={wfDescRef}
                                        disabled={continued}
                                    />
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>Team Involved</Form.Label>
                                    <DropdownList
                                        defaultValue="Select a team"
                                        data={teams}
                                        textField="name"
                                        onChange={(val) => setWfTeam(val)}
                                        disabled={continued}
                                    />
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>Final Due Date</Form.Label>
                                    <br />
                                    <DatePicker
                                        value={wfDate}
                                        onSelect={(date) => setWfDate(date)}
                                        valueEditFormat={{ dateStyle: "short" }}
                                        valueDisplayFormat={{
                                            dateStyle: "medium",
                                        }}
                                        disabled={continued}
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    onClick={handleContinue}
                                    className="w-100 mt-4"
                                    disabled={continued}
                                >
                                    Continue
                                </Button>

                                {continued && renderWfTasks()}
                            </Form>
                        </Localization>
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default NewWorkflow;
