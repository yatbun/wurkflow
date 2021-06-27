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
 * Redirects to the homepage if `currentUser` is logged in. Used to prevent the
 * user from access pages that a logged in user would not require.
 *
 * @category Routing
 * @hideconstructor
 * @component
 */
function LoggedOutRoute({ component: Component, ...rest }) {
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
                    <Redirect to="/" />
                ) : (
                    <Component {...props} />
                );
            }}
        ></Route>
    );
}

export default LoggedOutRoute;
