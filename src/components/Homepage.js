// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// Styling imports
import { Container } from "react-bootstrap";

// Context imports
import { useAuth } from "../contexts/AuthContext";

// Page Component imports
import PageHeader from "./PageHeader";
import Dashboard from "./Dashboard";
import LoggedOutHome from "./LoggedOutHome";

/**
 * @classdesc
 * Wrapper page for the home directory.
 *
 * If user is logged in, will display the dashboard. Otherwise, the homepage
 * will be displayed instead.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Homepage() {
    // ------------------------------------------------------------------------
    // DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentUser } = useAuth();
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {currentUser ? <Dashboard /> : <LoggedOutHome />}
            </Container>
        </>
    );
}

export default Homepage;
