// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Styling imports
import { Container } from "react-bootstrap";

// Context imports
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import PageHeader from "./PageHeader";
import TemplateListItem from "./TemplateListItem";

/**
 * @classdesc
 * The page for users to kickstart an instance of a workflow template.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function KickstartWorkflow() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { teams } = useStore();

    // useState declarations
    const [templates, setTemplates] = useState([]);
    // ------------------------------------------------------------------------

    /**
     * Gets all the worklfow templates that belongs to the teams that the user
     * is in and updates the `templates` state.
     *
     * @returns {void}
     */
    async function getWorkflowTemplates() {
        const promises = [];
        const tempTemplates = [];

        teams.forEach((team) => {
            promises.push(
                store
                    .collection("wfTemplates")
                    .where(
                        "team",
                        "==",
                        store.collection("teams").doc(team.uid)
                    )
                    .get()
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            tempTemplates.push.apply(
                                tempTemplates,
                                querySnapshot.docs
                            );
                        }
                    })
            );
        });

        Promise.all(promises).then(() => {
            setTemplates(tempTemplates);
        });
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Gets all workflow templates on load
    useEffect(() => {
        getWorkflowTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Updates all workflow templates upon change of users' teams
    useEffect(() => {
        getWorkflowTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded ">
                        <h1>Kickstart Workflow</h1>
                        <p>
                            Choose from the list of workflow templates in your
                            teams and kickstart them right now!
                        </p>
                    </Container>
                    <Container className="col-sm-8 mx-auto p-5">
                        {templates.length === 0 ? (
                            <>
                                <h2>No available templates</h2>
                                <p>
                                    Make one <Link to="/new-workflow">now</Link>
                                    !
                                </p>
                            </>
                        ) : (
                            <h2>Available templates</h2>
                        )}
                        {templates.map((template) => (
                            <TemplateListItem
                                template={template}
                                key={template.id}
                            />
                        ))}
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default KickstartWorkflow;
