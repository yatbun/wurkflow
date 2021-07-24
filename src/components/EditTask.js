import React from "react";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Modal, ListGroup, Button } from "react-bootstrap";
import { useParams, useHistory } from "react-router-dom";
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";
import { DateLocalizer } from "react-widgets/IntlLocalizer";
import Localization from "react-widgets/Localization";

import DatePicker from "react-widgets/DatePicker";

import { FaExclamationTriangle } from "react-icons/fa";

import PageHeader from "./PageHeader";

export default function EditTask() {
    const { id } = useParams();
    const history = useHistory();
    const { updateTaskName, updateTaskDesc, updateTaskProgress, updateTaskDueDate } = useStore();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [task, setTask] = useState(null);
    const [taskDate, setTaskDate] = useState(new Date());
    const [taskUsers, setTaskUsers] = useState([]);
    const [remainingUsers, setRemainingUsers] = useState([]);
    const [taskCreator, setTaskCreator] = useState(null);
    const [userId, setUserId] = useState(null);

    const taskNameRef = useRef();
    const taskDescRef = useRef();
    const [progress, setProgress] = useState();

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

    async function getTaskUsers() {
        const promises = [];
        const tempUsers = [];
        if (task.users.length > 0) {
            task.users.forEach((user) => {
                promises.push(
                    user.get().then((doc) => {
                        const tempUser = doc.data();
                        tempUser.uid = doc.id;
                        tempUsers.push(tempUser);
                    })
                );
            });
        }
        Promise.all(promises).then(() => {
            setTaskUsers(tempUsers);
        });
    }

    async function getTaskCreator() {
        Promise.resolve(
            task.creator.get().then((doc) => {
                return doc.data();
            })
        ).then((data) => {
            setTaskCreator(data);
        });
    }

    function getRemainingUsers() {
        const teamUsers = [];
        const promises = [];
        let remaining = [];
        promises.push(
            store
                .collection("users")
                .where("teams", "array-contains", store.collection("teams").doc(task.team.id))
                .get()
                .then((querySnapShot) => {
                    querySnapShot.forEach((doc) => {
                        const userData = doc.data();
                        userData.uid = doc.id;
                        userData.added = false;
                        teamUsers.push(userData);
                    });
                })
        );
        Promise.all(promises).then(() => {
            if (taskUsers.length > 0) {
                teamUsers.map((user) => {
                    for (let i = 0; i < taskUsers.length; i++) {
                        if (user.uid === taskUsers[i].uid) {
                            break;
                        }
                        if (i === taskUsers.length - 1) {
                            user.added = false;
                            remaining.push(user);
                        }
                    }
                });
                setRemainingUsers(remaining);
            } else {
                setRemainingUsers(teamUsers);
            }
        });
    }

    const [action, setAction] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    function modalAction() {
        if (action === "removeUser") {
            handleRemove(userId);
        }
        closeModal();
    }

    function openModal(action, id) {
        setAction(action);
        setUserId(id);
        setShowModal(true);
    }

    function closeModal() {
        setAction("");
        setShowModal(false);
    }

    function openUserModal() {
        getRemainingUsers();
        setShowUserModal(true);
    }

    function closeUserModal() {
        setAction("");
        setShowUserModal(false);
    }

    function handleClick(user, index) {
        let updatedUsers = [];
        let promises = [];
        if (taskUsers.length > 0) {
            updatedUsers = taskUsers;
        }
        updatedUsers.push(user);

        promises.push(
            store
                .collection("tasks")
                .doc(id)
                .update({
                    users: updatedUsers.map((user) => store.collection("users").doc(user.uid)),
                })
        );

        // previously did updated = remainingUsers but object reference is still the same
        // updated = [...remainingUsers] creates a copy of remainingUsers and assigns it to updated instead
        const updated = [...remainingUsers];
        updated[index].added = true;
        setRemainingUsers(updated);

        Promise.all(promises).then(() => {
            setTaskUsers(updatedUsers);
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const promises = [];
        const completed = task.completed ? "Completed" : "In Progress";

        if (taskNameRef.current.value !== task.name) {
            promises.push(updateTaskName(taskNameRef.current.value, id));
        }
        if (taskDescRef.current.value !== task.desc) {
            promises.push(updateTaskDesc(taskDescRef.current.value, id));
        }
        if (progress !== completed) {
            promises.push(updateTaskProgress(!task.completed, id));
        }
        if (taskDate !== task.due.toDate()) {
            promises.push(updateTaskDueDate(taskDate, id));
        }

        Promise.all(promises)
            .then(() => {
                window.location.reload();
            })
            .catch((e) => {
                setError("Failed to update account. " + e.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function handleRemove(uid) {
        const updatedUsers = taskUsers.filter((user) => user.uid !== uid);
        store
            .collection("tasks")
            .doc(id)
            .update({
                users: updatedUsers.map((user) => store.collection("users").doc(user.uid)),
            });
        setTaskUsers(updatedUsers);
    }

    const Content = () => {
        if (task) {
            return (
                <>
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

                    <Modal show={showUserModal} onHide={closeUserModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Users</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <ListGroup variant="flush">
                                {remainingUsers &&
                                    remainingUsers.map((user, index) => (
                                        <ListGroup.Item variant="" key={user.uid}>
                                            <Row>
                                                <Col>{user.name}</Col>
                                                <Col className="text-right">
                                                    {user.added === false ? (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleClick(user, index)}
                                                        >
                                                            {" "}
                                                            Add{" "}
                                                        </Button>
                                                    ) : (
                                                        <p className="text-muted">
                                                            {" "}
                                                            Successfully added!{" "}
                                                        </p>
                                                    )}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                            </ListGroup>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeUserModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1> Edit task: {task && task.name} </h1>
                        <p> Change any information with regards to your task here.</p>
                    </Container>

                    <Container>
                        <Row>
                            <Col className="my-3">
                                <h3> Task Details: </h3>
                                <Localization
                                    date={new DateLocalizer({ culture: "en-GB", firstOfWeek: 7 })}
                                >
                                    <Form onSubmit={handleSubmit} className="my-4">
                                        <Form.Group as={Row} id="taskName">
                                            <Form.Label column sm="3">
                                                Task Name
                                            </Form.Label>
                                            <Col sm="7">
                                                <Form.Control
                                                    ref={taskNameRef}
                                                    type="text"
                                                    required
                                                    defaultValue={task.name}
                                                />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} id="taskName">
                                            <Form.Label column sm="3">
                                                Task Description
                                            </Form.Label>
                                            <Col sm="7">
                                                <Form.Control
                                                    ref={taskDescRef}
                                                    as="textarea"
                                                    required
                                                    defaultValue={task.desc}
                                                />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} id="taskName">
                                            <Form.Label column sm="3">
                                                Task Status
                                            </Form.Label>
                                            <Col sm="4">
                                                {task.completed ? (
                                                    <Form.Control
                                                        onChange={(value) => setProgress(value)}
                                                        as="select"
                                                        defaultValue="Completed"
                                                        custom
                                                    >
                                                        <option> Completed </option>
                                                        <option> In Progress </option>
                                                    </Form.Control>
                                                ) : (
                                                    <Form.Control
                                                        onChange={(value) => setProgress(value)}
                                                        as="select"
                                                        defaultValue="In Progress"
                                                        custom
                                                    >
                                                        <option> In Progress </option>
                                                        <option> Completed </option>
                                                    </Form.Control>
                                                )}
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} id="taskName">
                                            <Form.Label column sm="3">
                                                Due Date
                                            </Form.Label>
                                            <Col sm="7">
                                                <DatePicker
                                                    value={taskDate}
                                                    onChange={(date) => setTaskDate(date)}
                                                />{" "}
                                            </Col>
                                        </Form.Group>
                                        <Button disabled={loading} type="submit">
                                            {" "}
                                            Update{" "}
                                        </Button>
                                    </Form>
                                </Localization>
                            </Col>

                            <Col className="my-3">
                                <Row>
                                    <Col xs={8}>
                                        <h3>Manage Users Involved </h3>{" "}
                                    </Col>
                                    <Col>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={openUserModal}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <p className="text-muted my-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-person-plus"
                                                    viewBox="0 0 16 16"
                                                    className="mx-3"
                                                >
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"
                                                    />
                                                </svg>
                                                Add users
                                            </p>
                                        </Button>
                                    </Col>
                                </Row>
                                <ListGroup variant="secondary" className="my-3">
                                    <ListGroup.Item variant="secondary">
                                        <Row>
                                            <Col>{taskCreator && taskCreator.name}</Col>
                                            <Col className="text-right font-weight-bold">
                                                Creator
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                    {taskUsers &&
                                        taskUsers.map((user) => (
                                            <ListGroup.Item variant="light" key={user.uid}>
                                                <Row>
                                                    <Col>{user.name} </Col>
                                                    <Col>
                                                        <Button
                                                            className="float-right"
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                openModal("removeUser", user.uid)
                                                            }
                                                        >
                                                            {" "}
                                                            Remove{" "}
                                                        </Button>
                                                    </Col>
                                                </Row>
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

    useEffect(() => {
        getTask();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (task) {
            getTaskUsers();
            getTaskCreator();
            setTaskDate(task.due.toDate());
            if (task.completed) {
                setProgress("Completed");
            } else {
                setProgress("In Progress");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);

    return (
        <div>
            <PageHeader />
            <Container className="pt-5 mt-5"> {Content()} </Container>
        </div>
    );
}
