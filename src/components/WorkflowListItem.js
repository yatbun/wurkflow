import { useState, useEffect } from "react";
import { store } from "../firebase";

import { Container, ListGroup } from "react-bootstrap";

export default function WorkflowListItem({ workflow }) {
    const wf = workflow.data();
    wf.uid = workflow.id;

    const [wfTasks, setWfTasks] = useState([]);

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

    useEffect(() => {
        getWorkflowTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container className="my-5 px-5 py-4 border rounded">
            <h4>{wf.name}</h4>
            <p>{wf.desc}</p>
            <br />
            <ListGroup horizontal>
                {wfTasks.map((task) => (
                    <ListGroup.Item
                        variant={task.order === wf.currentTask ? "primary" : "light"}
                        key={task.uid}
                    >
                        {task.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}
