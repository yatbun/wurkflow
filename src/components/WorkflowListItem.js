// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";

// Styling imports
import { Container, ListGroup, Badge, Button } from "react-bootstrap";

// Context imports
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";

/**
 * @classdesc
 * List display of an individual workflow instance.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function WorkflowListItem({ workflow, refreshFn }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    const wf = workflow.data();
    wf.uid = workflow.id;
    const completed = wf.currentTask > wf.length;

    // Context declarations
    const { deleteWorkflow } = useStore();

    // useState declarations
    const [wfTasks, setWfTasks] = useState([]);

    /**
     * Gets the tasks that are associated with the workflow.
     *
     * @returns {void}
     */
    async function getWorkflowTasks() {
        const tempTasks = [];

        store
            .collection("tasks")
            .where("workflow", "==", store.collection("workflows").doc(wf.uid))
            .orderBy("order", "asc")
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((doc) => {
                    const tempTask = doc.data();
                    tempTask.uid = doc.id;
                    tempTasks.push(tempTask);
                });
            })
            .finally(() => {
                setWfTasks(tempTasks);
            });
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Gets the workflow tasks on page load
    useEffect(() => {
        getWorkflowTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ------------------------------------------------------------------------

    return (
        <Container className="my-5 px-5 py-4 border rounded position-relative">
            <Button
                className="position-absolute"
                variant="danger"
                style={{ right: 25 }}
                onClick={async () => {
                    await deleteWorkflow(wf.uid);
                    await refreshFn();
                }}
                disabled={!completed}
            >
                Delete
            </Button>
            <h4 data-testid="wfName">
                {wf.name} {completed && <Badge variant="success">Complete</Badge>}
            </h4>
            <p data-testid="wfDesc">{wf.desc}</p>
            <br />
            <ListGroup horizontal>
                {wfTasks.map((task) => (
                    <ListGroup.Item
                        variant={
                            task.order === wf.currentTask ? "primary" : "light"
                        }
                        key={task.uid}
                    >
                        {task.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}

export default WorkflowListItem;
