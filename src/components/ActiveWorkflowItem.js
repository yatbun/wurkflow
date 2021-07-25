// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";

// Context imports
import { store } from "../firebase";

// Styling imports
import { ListGroup } from "react-bootstrap";

// Page components imports
import WorkflowListItemTask from "./WorkflowListItemTask";

/**
 * @classdesc
 * Dashboard active workflow display.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function ActiveWorkflowItem({ workflow }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Constant declarations
    const wfData = workflow.data();
    wfData.uid = workflow.id;

    // useState declarations
    const [currTask, setCurrTask] = useState(null);

    /**
     * Gets the tasks that are associated with the workflow.
     *
     * @returns {void}
     */
    async function getWorkflowTasks() {
        store
            .collection("tasks")
            .where(
                "workflow",
                "==",
                store.collection("workflows").doc(wfData.uid)
            )
            .where("order", "==", wfData.currentTask)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    setCurrTask(null);
                } else {
                    const tempTask = querySnapshot.docs[0].data();
                    tempTask.uid = querySnapshot.docs[0].id;
                    setCurrTask(tempTask);
                }
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

    if (currTask !== null) {
        return (
            <ListGroup.Item style={{ minWidth: "200px", maxWidth: "300px" }}>
                <h5>{wfData.name}</h5>
                <p>{wfData.desc}</p>

                <ListGroup>
                    <WorkflowListItemTask
                        task={currTask}
                        currentTask={wfData.currentTask}
                    />
                </ListGroup>
            </ListGroup.Item>
        );
    } else {
        return <></>;
    }
}

export default ActiveWorkflowItem;
