// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState } from "react";
import { Link } from "react-router-dom";

// Styling imports
import { OverlayTrigger, Tooltip, Button, Modal } from "react-bootstrap";
import { FaEye, FaCheck, FaTrash, FaExclamationTriangle } from "react-icons/fa";

// Context imports
import { useStore } from "../contexts/StoreContext";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Each row of the task table.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function TaskTableItem({ task, index }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { deleteTask, completeTask } = useStore();

    // useState declarations
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState("");
    // ------------------------------------------------------------------------

    /**
     * Checks the current modal action and assigns it to `actionTask` for use
     * by the `Modal`.
     *
     * @returns {void}
     */
    function modalAction() {
        if (action === "delete") {
            deleteTask(task.uid);
        } else if (action === "complete") {
            completeTask(task.uid);
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
    function openModal(action) {
        setAction(action);
        setShowModal(true);
    }

    /**
     * Handles the closing of the `Modal`.
     *
     * @returns {void}
     */
    function closeModal() {
        setAction("");
        setShowModal(false);
    }

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

            <tr key={index}>
                <td>{index + 1}</td>
                <td>{task.name}</td>
                <td>{task.desc}</td>
                <td>{task.dueDate.toLocaleDateString("en-GB")}</td>
                <td>{task.teamName}</td>
                <td>
                    <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
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
                                    Task has already been marked as completed
                                </Tooltip>
                            ) : (
                                <Tooltip>Complete</Tooltip>
                            )
                        }
                    >
                        <span className="d-inline-block me-md-2 my-1">
                            <Button
                                onClick={() => openModal("complete")}
                                variant="success"
                                size="sm"
                                disabled={task.completed}
                            >
                                <FaCheck />
                            </Button>
                        </span>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                        <span className="d-inline-block my-1">
                            <Button
                                onClick={() => openModal("delete")}
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
        </>
    );
}

export default TaskTableItem;
