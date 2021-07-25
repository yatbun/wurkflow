// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Styling imports
import { Container, ListGroup, Popover, OverlayTrigger } from "react-bootstrap";

/**
 * @classdesc
 * The task `ListGroup` item. Includes its own `Popover`.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function WorkflowListItemTask({ task, currentTask }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // useState declarations
    const [taskUsers, setTaskUsers] = useState([]);
    // ------------------------------------------------------------------------

    /**
     * Gets the list of users involved in the task.
     *
     * @returns {void}
     */
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
            <Link to={`/task/${task.uid}`}>
                <ListGroup.Item
                    variant={task.order === currentTask ? "primary" : "light"}
                    key={task.uid}
                    style={{ cursor: "pointer" }}
                >
                    {task.name}
                </ListGroup.Item>
            </Link>
        </OverlayTrigger>
    );
}

export default WorkflowListItemTask;
