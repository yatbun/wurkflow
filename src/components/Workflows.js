// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Styling imports
import { Container, Button } from "react-bootstrap";

// Context imports
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
import WorkflowListItem from "./WorkflowListItem";

/**
 * @classdesc
 * Page to display user's workflow instances.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Workflows() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { teams } = useStore();

    // useState declarations
    const [workflows, setWorkflows] = useState([]);
    // ------------------------------------------------------------------------

    /**
     * Acquires workflows that belong to the teams that the user is part of.
     *
     * @returns {void}
     */
    async function getWorkflows() {
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
            setWorkflows(wf);
        });
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Gets the list of workflows on page load.
    useEffect(() => {
        getWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Updates the list of workflows should `teams` state be updated.
    useEffect(() => {
        getWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Workflows</h1>
                        <p>
                            Manage your active workflows here! Create new ones
                            to cater to your teams' processes and kickstart them
                            whenever you require.
                        </p>
                        <Link to="kickstart-workflow">
                            <Button variant="danger" size="lg">
                                Kickstart Workflow
                            </Button>
                        </Link>
                        <Link to="/new-workflow">
                            <Button
                                variant="outline-danger"
                                size="lg"
                                className="mx-3"
                            >
                                New Workflow
                            </Button>
                        </Link>
                    </Container>
                    <Container className="col-sm-12 mx-auto my-5">
                        {workflows.length === 0 ? (
                            <h2>No active workflows</h2>
                        ) : (
                            <h2>Active Workflows</h2>
                        )}
                        {workflows.map((workflow) => (
                            <WorkflowListItem
                                workflow={workflow}
                                refreshFn={getWorkflows}
                                key={workflow.id}
                            />
                        ))}
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default Workflows;
