// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";

// Styling imports
import { Container, ListGroup, Popover, OverlayTrigger } from "react-bootstrap";

function WorkflowListItemTask({ task, currentTask }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // useState declarations
    const [taskUsers, setTaskUsers] = useState([]);
    // ------------------------------------------------------------------------

    function getTaskUsers() {
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

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Get the users involved in the task
    useEffect(() => {
        getTaskUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ------------------------------------------------------------------------

    return (
        <OverlayTrigger
            trigger={["hover", "hover"]}
            placement="bottom"
            overlay={
                <Popover id="popover-basic">
                    <Container className="p-2">
                        <h6>Description:</h6>
                        {task.desc}

                        <h6 className="mt-3">Involved Users:</h6>
                        <ListGroup></ListGroup>
                        {taskUsers.map((user, index) => (
                            <ListGroup.Item key={index}>
                                {user.name}
                            </ListGroup.Item>
                        ))}
                    </Container>
                </Popover>
            }
        >
            <ListGroup.Item
                variant={task.order === currentTask ? "primary" : "light"}
                key={task.uid}
                style={{ cursor: "pointer" }}
            >
                {task.name}
            </ListGroup.Item>
        </OverlayTrigger>
    );
}

export default WorkflowListItemTask;
