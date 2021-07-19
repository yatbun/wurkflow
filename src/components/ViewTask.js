import { useState, useEffect, useRef } from "react";
import {
    Container,
    Row,
    Col,
    Badge,
    ListGroup,
    Form,
    Button,
    InputGroup,
    Modal,
} from "react-bootstrap";
import { useParams, Link, useHistory } from "react-router-dom";
import { store } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

import PageHeader from "./PageHeader";

dayjs.extend(relativeTime);

export default function ViewTask() {
    const { id } = useParams();
    const history = useHistory();
    const { currentUser } = useAuth();

    const [task, setTask] = useState(null);
    const [taskUsers, setTaskUsers] = useState([]);
    const [taskCreator, setTaskCreator] = useState(null);
    const [comments, setComments] = useState([]);
    const [cid, setCid] = useState();
    const [action, setAction] = useState();
    const [showModal, setShowModal] = useState(false);

    const commentRef = useRef();

    function modalAction() {
        if (action === "remove") {
            deleteComment(cid);
        }
        closeModal();
    }

    function openModal(action, cid) {
        setShowModal(true);
        setCid(cid);
        setAction(action);
    }

    function closeModal() {
        setShowModal(false);
    }

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

    async function getTaskCreator() {
        Promise.resolve(
            task.creator.get().then((doc) => {
                return doc.data();
            })
        ).then((data) => {
            setTaskCreator(data);
        });
    }

    async function getComments() {
        const comments = [];
        const promise = [];
        promise.push(
            store
                .collection("comments")
                .where("taskId", "==", store.collection("tasks").doc(id))
                .get()
                .then((snapshot) => {
                    snapshot.forEach((doc) => {
                        const newComment = doc.data();
                        newComment.dateCreated = newComment.createdAt.toDate();
                        newComment.id = doc.id;
                        comments.push(newComment);
                    });
                })
        );
        Promise.all(promise).then(() => {
            comments.sort((a, b) => {
                const na = a.dateCreated;
                const nb = b.dateCreated;

                if (na < nb) {
                    return 1;
                }
                if (na > nb) {
                    return -1;
                }
                return 0;
            });
            setComments(comments);
        });
    }

    async function handleComment(e) {
        e.preventDefault();

        if (commentRef.current.value === "") {
        }

        const newComment = {
            taskId: store.collection("tasks").doc(id),
            userId: store.collection("users").doc(currentUser.uid),
            name: currentUser.displayName,
            body: commentRef.current.value,
            createdAt: new Date(),
        };

        store
            .collection("comments")
            .add(newComment)
            .then(() => {
                getComments();
            });
    }

    async function deleteComment(cid) {
        store
            .collection("comments")
            .doc(cid)
            .delete()
            .then(() => {
                getComments();
            });
    }

    const renderTasks = () => {
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

                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <Link
                            to={`/edit-task/${id}`}
                            className="position-absolute text-muted"
                            style={{ color: "black", top: 3, left: "96%" }}
                        >
                            <p>Edit</p>
                        </Link>
                        <h1>
                            {task && task.name}
                            {task && task.completed ? (
                                <Badge variant="success" className="align-top my-2 mx-3">
                                    <h6 className="my-0"> Completed </h6>
                                </Badge>
                            ) : (
                                <Badge variant="warning" className="align-middle my-2 mx-3">
                                    <h6 className="my-0"> In Progress </h6>
                                </Badge>
                            )}
                        </h1>
                        <p className="mx-1"> {task && task.desc} </p>
                    </Container>

                    <Container className="my-4">
                        <Row>
                            <Col>
                                <h5> Comments </h5>
                                <p className="my-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        class="bi bi-person-circle"
                                        viewBox="0 0 16 16"
                                        className="mx-1"
                                    >
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                        <path
                                            fill-rule="evenodd"
                                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                                        />
                                    </svg>{" "}
                                    {currentUser.displayName}
                                </p>
                                <Form className="my-0" onSubmit={handleComment}>
                                    <InputGroup>
                                        <Form.Control
                                            ref={commentRef}
                                            type="text"
                                            placeholder="Enter your Comment here..."
                                        ></Form.Control>
                                        <Button
                                            type="submit"
                                            variant="light"
                                            size="sm"
                                            className=""
                                        >
                                            {" "}
                                            Comment{" "}
                                        </Button>
                                    </InputGroup>
                                </Form>

                                <ListGroup variant="flush" className="my-5">
                                    {comments &&
                                        comments.map((comment) => (
                                            <ListGroup.Item>
                                                <Row>
                                                    <Col>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            fill="currentColor"
                                                            class="bi bi-person-circle"
                                                            viewBox="0 0 16 16"
                                                            className="mx-1"
                                                        >
                                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                                            <path
                                                                fill-rule="evenodd"
                                                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                                                            />
                                                        </svg>
                                                    </Col>
                                                    <Col xs={9}>
                                                        <p className="font-weight-bold">
                                                            {" "}
                                                            {comment.name}
                                                        </p>
                                                        {comment.body}{" "}
                                                        <p
                                                            className="text-muted"
                                                            style={{ fontSize: 14 }}
                                                        >
                                                            {" "}
                                                            {dayjs(comment.createdAt.toDate()).from(
                                                                dayjs(new Date())
                                                            )}
                                                        </p>{" "}
                                                    </Col>

                                                    <Col>
                                                        {currentUser.uid === comment.userId.id ? (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openModal("remove", comment.id)
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        ) : (
                                                            <div></div>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                </ListGroup>
                            </Col>

                            <Col>
                                <h5> Users involved </h5>
                                <ListGroup variant="secondary">
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

    useEffect(() => {
        getTask();
        getComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (task) {
            getTaskUsers();
            getTaskCreator();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);

    return (
        <div>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">{renderTasks()}</Container>
            </Container>
        </div>
    );
}
