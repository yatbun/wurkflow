// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { Route, Redirect } from "react-router-dom";

// Context imports
import { useAuth } from "../contexts/AuthContext";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Redirects to the homepage if `currentUser` is not logged in. Used to prevent
 * users that are not logged in from accessing restricted pages.
 *
 * @category Routing
 * @hideconstructor
 * @component
 */
function LoggedInRoute({ component: Component, ...rest }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { currentUser } = useAuth();
    // ------------------------------------------------------------------------

    return (
        <Route
            {...rest}
            render={(props) => {
                return currentUser ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/" />
                );
            }}
        ></Route>
    );
}

export default LoggedInRoute;
