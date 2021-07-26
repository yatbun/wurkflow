// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";

// Styling imports
import { Container, ListGroup } from "react-bootstrap";

// Context imports
import { store } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import CalendarView from "./CalendarView";
import TaskTableView from "./TaskTableView";
import ActiveWorkflowItem from "./ActiveWorkflowItem";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The dashboard page (logged in homepage).
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Dashboard() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentUser } = useAuth();
    const { tasks, teams } = useStore();

    // useState declarations
    const [activeWorkflows, setActiveWorkflows] = useState([]);

    // ------------------------------------------------------------------------

    /**
     * Acquires workflows that belong to the teams that the user is part of.
     *
     * @returns {void}
     */
    async function getActiveWorkflows() {
        const promises = [];
        const wf = [];

        teams.forEach((team) => {
            promises.push(
                store
                    .collection("workflows")
                    .where(
                        "team",
                        "==",
                        store.collection("teams").doc(team.uid)
                    )
                    .get()
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            wf.push.apply(wf, querySnapshot.docs);
                        }
                    })
            );
        });
        Promise.all(promises).then(() => {
            setActiveWorkflows(wf);
            console.log(wf);
        });
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Gets the list of active workflows on page load.
    useEffect(() => {
        getActiveWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Updates the list of workflows should `teams` state be updated.
    useEffect(() => {
        getActiveWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams]);
    // ------------------------------------------------------------------------

    return (
        <>
            <Container className="d-flex flex-column">
                <Container
                    className="col-sm-12 mx-auto bg-light p-5 rounded"
                    data-testid="Dashboard"
                >
                    <h1 data-testid="Dashboard-name">
                        Welcome, {currentUser.displayName}!
                    </h1>
                    <h4 data-testid="Dashboard-task">
                        You have {tasks.length} ongoing{" "}
                        {tasks.length === 1 ? "task" : "tasks"}.
                    </h4>
                </Container>

                <Container className="col-sm-12 mx-auto p-4">
                    <CalendarView tasks={tasks} />
                </Container>

                {activeWorkflows.length > 0 && (
                    <Container
                        className="col-sm-12 mx-auto"
                        style={{ overflowY: "hidden", overflowX: "scroll" }}
                    >
                        <ListGroup horizontal className="mt-4">
                            {activeWorkflows.map((workflow, index) => (
                                <ActiveWorkflowItem
                                    workflow={workflow}
                                    key={index}
                                />
                            ))}
                        </ListGroup>
                    </Container>
                )}

                <Container className="col-sm-12 mx-auto p-4">
                    {tasks.length > 0 ? (
                        <>
                            <h2>Next tasks</h2>
                            <TaskTableView tasks={tasks} />
                        </>
                    ) : (
                        <h2>No upcoming tasks</h2>
                    )}
                </Container>
            </Container>
        </>
    );
}

export default Dashboard;
