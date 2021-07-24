// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// Styling imports
import { Container } from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";

// Page component imports
import CalendarView from "./CalendarView";
import TaskTableView from "./TaskTableView";
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
    const { tasks } = useStore();
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
