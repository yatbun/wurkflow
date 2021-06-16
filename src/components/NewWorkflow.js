import { useRef, useState, useEffect } from "react";
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";
import { add } from "date-fns";
import { DateLocalizer } from "react-widgets/IntlLocalizer";

import { Container, Form, Button, ButtonGroup, Badge, Card, Spinner } from "react-bootstrap";

import PageHeader from "./PageHeader";
import Multiselect from "react-widgets/Multiselect";
import Localization from "react-widgets/esm/Localization";
import DatePicker from "react-widgets/DatePicker";
import NumberPicker from "react-widgets/NumberPicker";

export default function NewWorkflow() {
    const { teams } = useStore();

    const wfNameRef = useRef();
    const wfDescRef = useRef();
    const wfTeamRef = useRef();
    const [wfDate, setWfDate] = useState(new Date());
    const [wfTeam, setWfTeam] = useState("");

    const [teamUsers, setTeamUsers] = useState([]);

    async function getTeamUsers() {
        if (wfTeam === "") {
            return;
        }

        const tuid = teams.filter((t) => {
            return t.name === wfTeam;
        })[0].uid;

        const users = [];

        store
            .collection("users")
            .where("teams", "array-contains", store.collection("teams").doc(tuid))
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((doc) => {
                    users.push(doc.data());
                });
            })
            .finally(() => {
                setTeamUsers(users);
            });
    }

    const blankTask = { name: "", desc: "", users: [], dueDate: wfDate };
    const [taskData, setTaskData] = useState([{ ...blankTask }]);

    function handleAdd(e) {
        e.preventDefault();

        setTaskData([...taskData, { ...blankTask }]);
    }

    function handleRemove(e) {
        e.preventDefault();

        if (taskData.length > 1) {
            setTaskData(taskData.slice(0, -1));
        }
    }

    function handleTaskDataChange(e) {
        const updatedTaskData = [...taskData];
        updatedTaskData[e.target.dataset.idx][e.target.id] = e.target.value;
        setTaskData(updatedTaskData);
    }

    function handleDateChange(idx, date) {
        const updatedTaskData = [...taskData];
        updatedTaskData[idx]["dueDate"] = date;
        setTaskData(updatedTaskData);
    }

    function handleUsersChange(idx, val) {
        const updatedTaskData = [...taskData];
        updatedTaskData[idx]["users"] = val;
        setTaskData(updatedTaskData);
    }

    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        // TODO: To implement creation of tasks

        console.log(taskData);

        setLoading(false);
    }

    useEffect(() => {
        getTeamUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wfTeam]);

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>New Workflow Template</h1>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas luctus
                            enim tellus. Interdum et malesuada fames ac ante ipsum primis in
                            faucibus.
                        </p>
                    </Container>
                    <Container className="col-sm-8 mx-auto my-5">
                        <Localization
                            date={new DateLocalizer({ culture: "en-GB", firstOfWeek: 7 })}
                        >
                            <Form onSubmit={handleSubmit}>
                                <h2>Template Settings</h2>

                                <Form.Group className="mt-4">
                                    <Form.Label>Workflow Name</Form.Label>
                                    <Form.Control type="text" ref={wfNameRef} />
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>Workflow Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} ref={wfDescRef} />
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>Team Involved</Form.Label>
                                    <Form.Control
                                        as="select"
                                        ref={wfTeamRef}
                                        className="form-select"
                                        defaultValue=""
                                        onChange={(e) => {
                                            setWfTeam(e.target.value);
                                        }}
                                    >
                                        {teams.map((team) => (
                                            <option key={team.uid}>{team.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group className="mt-4">
                                    <Form.Label>Final Due Date</Form.Label>
                                    <br />
                                    <DatePicker
                                        value={wfDate}
                                        onSelect={(date) => setWfDate(date)}
                                        valueEditFormat={{ dateStyle: "short" }}
                                        valueDisplayFormat={{ dateStyle: "medium" }}
                                        format="mmm YYY"
                                    />
                                </Form.Group>

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

                                {taskData.map((val, idx) => {
                                    const nameId = `name-${idx}`;
                                    const descId = `desc-${idx}`;
                                    const usersId = `users-${idx}`;
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
                                                        <Form.Label>Days Due Before</Form.Label>
                                                        <NumberPicker
                                                            defaultValue={0}
                                                            min={0}
                                                            onChange={(val) => {
                                                                const newDate = add(wfDate, {
                                                                    days: -val,
                                                                });

                                                                handleDateChange(idx, newDate);
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </Container>
                                                <Container className="w-50">
                                                    <Form.Group>
                                                        <Form.Label>Task Due Date</Form.Label>
                                                        <br />
                                                        <DatePicker
                                                            value={taskData[idx].dueDate}
                                                            valueDisplayFormat={{
                                                                dateStyle: "medium",
                                                            }}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Container>
                                            </Form.Row>

                                            <Form.Group className="mt-4">
                                                <Form.Label>Users Involved</Form.Label>
                                                <Multiselect
                                                    defaultValue={[]}
                                                    data={teamUsers.map((user) => user.name)}
                                                    onChange={(sel) => handleUsersChange(idx, sel)}
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
                            </Form>
                        </Localization>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
