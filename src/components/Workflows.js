import { useState, useEffect } from "react";
import { store } from "../firebase";
import { useStore } from "../contexts/StoreContext";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

import PageHeader from "./PageHeader";
import WorkflowListItem from "./WorkflowListItem";

export default function Workflows() {
    const { teams } = useStore();
    const [workflows, setWorkflows] = useState([]);

    async function getWorkflows() {
        const promises = [];
        const wf = [];

        teams.forEach((team) => {
            promises.push(
                store
                    .collection("workflows")
                    .where("team", "==", store.collection("teams").doc(team.uid))
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

    useEffect(() => {
        getWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams]);

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                <Container className="d-flex flex-column">
                    <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                        <h1>Workflows</h1>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas luctus
                            enim tellus. Interdum et malesuada fames ac ante ipsum primis in
                            faucibus.
                        </p>
                        <Link to="kickstart-workflow">
                            <Button variant="danger" size="lg">
                                Kickstart Workflow
                            </Button>
                        </Link>
                        <Link to="/new-workflow">
                            <Button variant="outline-danger" size="lg" className="mx-3">
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
                            <WorkflowListItem workflow={workflow} key={workflow.id} />
                        ))}
                    </Container>
                </Container>
            </Container>
        </>
    );
}
