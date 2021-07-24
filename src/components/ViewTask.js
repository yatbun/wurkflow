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
    Collapse,
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
    const [reply, setReply] = useState([]);
    const [cid, setCid] = useState();
    const [action, setAction] = useState();
    const [showModal, setShowModal] = useState(false);
    const [replyValue, setReplyValue] = useState("");

    const commentRef = useRef();

    function modalAction() {
        if (action === "remove") {
            deleteComment(cid);
        } else if (action === "removeReply") {
            removeReply();
        }
        closeModal();
    }

    function openModal(action, cid, index) {
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
                        newComment.showReplyForm = false;
                        newComment.showReplies = false;
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
            console.log(comments);

            const promises = [];
            const allReplies = [];

            promises.push(
                comments.forEach((comment) => {
                    const replies = [];
                    store
                        .collection("replies")
                        .where("commentId", "==", store.collection("comments").doc(comment.id))
                        .get()
                        .then((snapShot) => {
                            snapShot.forEach((doc) => {
                                const newReply = doc.data();
                                newReply.id = doc.id;
                                newReply.dateCreated = newReply.createdAt.toDate();
                                replies.push(newReply);
                            });
                        });
                    allReplies.push(replies);
                })
            );

            Promise.all(promises).then(() => {
                if (allReplies.length === 0) {
                    console.log(2);
                    setReply([]);
                } else {
                    allReplies.forEach((replies) => {
                        replies.sort((a, b) => {
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
                    });
                    setReply(allReplies);
                    console.log(reply);
                }
            });
        });
    }

    function showReplies(index) {
        const newComments = [...comments];
        const bool = newComments[index].showReplies;
        newComments[index].showReplies = !bool;
        setComments(newComments);
    }

    async function removeReply() {
        store
            .collection("replies")
            .doc(cid)
            .delete()
            .then(() => {
                getComments();
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
            .collection("replies")
            .where("commentId", "==", store.collection("comments").doc(cid))
            .get()
            .then((snapShot) => {
                snapShot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        store
            .collection("comments")
            .doc(cid)
            .delete()
            .then(() => {
                getComments();
            });
    }

    async function handleReply(cid, event, index) {
        event.preventDefault();

        const newReply = {
            createdAt: new Date(),
            userId: store.collection("users").doc(currentUser.uid),
            commentId: store.collection("comments").doc(cid),
            name: currentUser.displayName,
            body: replyValue,
        };

        store
            .collection("replies")
            .add(newReply)
            .then(() => {
                getComments();
            });
    }

    function handleChange(event) {
        setReplyValue(event.target.value);
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
                                        comments.map((comment, index) => (
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
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            fill="currentColor"
                                                            class="bi bi-reply"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.306 7.404 7.404 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254a.503.503 0 0 0-.042-.028.147.147 0 0 1 0-.252.499.499 0 0 0 .042-.028l3.984-2.933zM7.8 10.386c.068 0 .143.003.223.006.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96v-.667z" />
                                                        </svg>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            style={{ textDecoration: "none" }}
                                                            onClick={() => {
                                                                const newComments = [...comments];
                                                                const bool =
                                                                    newComments[index]
                                                                        .showReplyForm;
                                                                newComments[index].showReplyForm =
                                                                    !bool;
                                                                setComments(newComments);
                                                            }}
                                                        >
                                                            <p
                                                                style={{
                                                                    color: "black",
                                                                    fontSize: 12,
                                                                }}
                                                                className="my-2"
                                                            >
                                                                {" "}
                                                                REPLY{" "}
                                                            </p>
                                                        </Button>
                                                    </Col>

                                                    <Col>
                                                        {currentUser.uid === comment.userId.id ? (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openModal(
                                                                        "remove",
                                                                        comment.id,
                                                                        0
                                                                    )
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        ) : (
                                                            <div></div>
                                                        )}
                                                    </Col>
                                                    <Collapse in={comment.showReplyForm}>
                                                        <Col>
                                                            <Form
                                                                className="mx-5"
                                                                onSubmit={(event) => {
                                                                    handleReply(
                                                                        comment.id,
                                                                        event,
                                                                        index
                                                                    );
                                                                }}
                                                            >
                                                                <Col>
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                            value={replyValue}
                                                                            onChange={handleChange}
                                                                            type="text"
                                                                            placeholder="Enter your Reply here..."
                                                                        ></Form.Control>
                                                                        <Button
                                                                            type="submit"
                                                                            variant="light"
                                                                            size="sm"
                                                                            className=""
                                                                        >
                                                                            {" "}
                                                                            Reply{" "}
                                                                        </Button>
                                                                    </InputGroup>
                                                                </Col>
                                                            </Form>
                                                        </Col>
                                                    </Collapse>
                                                </Row>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => {
                                                        showReplies(index);
                                                    }}
                                                >
                                                    View Replies
                                                </Button>

                                                <Collapse in={comment.showReplies}>
                                                    <Col>
                                                        <ListGroup variant="flush">
                                                            {reply[index] &&
                                                                reply[index].map((reply) => (
                                                                    <ListGroup.Item>
                                                                        <Row>
                                                                            <Col>
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="16"
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
                                                                            <Col xs={8}>
                                                                                <p
                                                                                    className="font-weight-bold my-1"
                                                                                    style={{
                                                                                        fontSize: 14,
                                                                                    }}
                                                                                >
                                                                                    {" "}
                                                                                    {reply.name}
                                                                                </p>
                                                                                {reply.body}{" "}
                                                                                <p
                                                                                    className="text-muted"
                                                                                    style={{
                                                                                        fontSize: 12,
                                                                                    }}
                                                                                >
                                                                                    {" "}
                                                                                    {dayjs(
                                                                                        reply.createdAt.toDate()
                                                                                    ).from(
                                                                                        dayjs(
                                                                                            new Date()
                                                                                        )
                                                                                    )}
                                                                                </p>{" "}
                                                                            </Col>

                                                                            <Col>
                                                                                {currentUser.uid ===
                                                                                reply.userId.id ? (
                                                                                    <Button
                                                                                        variant="danger"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            openModal(
                                                                                                "removeReply",
                                                                                                reply.id,
                                                                                                index
                                                                                            )
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
                                                </Collapse>
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
