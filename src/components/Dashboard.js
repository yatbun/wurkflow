// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// Styling imports
import { Container } from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
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
                    <h1 data-testid="Dashboard-name">Welcome, {currentUser.displayName}!</h1>
                    <h4 data-testid="Dashboard-task">You have {tasks.length} ongoing tasks.</h4>
                </Container>
            </Container>
        </>
    );
}

export default Dashboard;
