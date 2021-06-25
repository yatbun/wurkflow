// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";
import { useParams, Link, useHistory } from "react-router-dom";

// Styling imports
import { Container, Row, Col, Badge, ListGroup } from "react-bootstrap";

// Context imports
import { store } from "../firebase";

// Page component imports
import PageHeader from "./PageHeader";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Page to display each task's detail. Takes in the task ID as the first param.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function ViewTask() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { id } = useParams();
    const history = useHistory();

    // useState declarations
    const [task, setTask] = useState(null);
    const [taskUsers, setTaskUsers] = useState([]);
    const [taskCreator, setTaskCreator] = useState(null);

    /**
     * Gets the data for the provided ID and sets it to the `task` state.
     *
     * @returns {void}
     */
    async function getTask() {
        store
            .collection("tasks")
            .doc(id)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    setTask(doc.data());
                } else {
                    history.push("/");
                }
            });
    }

    /**
     * Gets the list of users involved in the task and updates the `TaskUsers`
     * state.
     *
     * @returns {void}
     */
    async function getTaskUsers() {
        const promises = [];
        const tempUsers = [];

        task.users.forEach((user) => {
            promises.push(
                user.get().then((doc) => {
                    const tempUser = doc.data();
                    tempUser.uid = doc.id;
                    tempUsers.push(tempUser);
                })
            );
        });
        Promise.all(promises).then(() => {
            setTaskUsers(tempUsers);
        });
    }

    /**
     * Gets the name of the task creator and saves it into the `TaskCreator`
     * state.
     *
     * @returns {void}
     */
    async function getTaskCreator() {
        Promise.resolve(
            task.creator.get().then((doc) => {
                return doc.data();
            })
        ).then((data) => {
            setTaskCreator(data);
        });
    }

    /**
     * Render function for the task.
     *
     * @returns {Component} The interface view of the task
     */
    const renderTasks = () => {
        if (task) {
            return (
                <>
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <Link
                            to="/edit-task"
                            className="position-absolute text-muted"
                            style={{ color: "black", top: 3, left: "96%" }}
                        >
                            <p>Edit</p>
                        </Link>
                        <h1>
                            {task && task.name}
                            {task && task.completed ? (
                                <Badge
                                    variant="success"
                                    className="align-top my-2 mx-3"
                                >
                                    <h6 className="my-0"> Completed </h6>
                                </Badge>
                            ) : (
                                <Badge
                                    variant="warning"
                                    className="align-middle my-2 mx-3"
                                >
                                    <h6 className="my-0"> In Progress </h6>
                                </Badge>
                            )}
                        </h1>
                        <p className="mx-1"> {task && task.desc} </p>
                    </Container>

                    <Container className="my-4">
                        <Row>
                            <Col>
                                <h5> Checklist </h5>
                            </Col>

                            <Col>
                                <h5> Users involved </h5>
                                <ListGroup variant="secondary">
                                    <ListGroup.Item variant="secondary">
                                        <Row>
                                            <Col>
                                                {taskCreator &&
                                                    taskCreator.name}
                                            </Col>
                                            <Col className="text-right font-weight-bold">
                                                Creator
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                    {taskUsers &&
                                        taskUsers.map((user) => (
                                            <ListGroup.Item
                                                variant="light"
                                                key={user.uid}
                                            >
                                                {user.name}
                                            </ListGroup.Item>
                                        ))}
                                </ListGroup>
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }
    };

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Get the task data on page load.
    useEffect(() => {
        getTask();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get the users involved in the task and the task creator once the task is
    // obtained.
    useEffect(() => {
        if (task) {
            getTaskUsers();
            getTaskCreator();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);
    // ------------------------------------------------------------------------

    return (
        <div>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">
                    {renderTasks()}
                </Container>
            </Container>
        </div>
    );
}

export default ViewTask;
