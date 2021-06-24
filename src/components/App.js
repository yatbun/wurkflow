// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Styling imports
import { Container } from "react-bootstrap";

// Context imports
import { AuthProvider } from "../contexts/AuthContext";
import { StoreProvider } from "../contexts/StoreContext";

// ----------------------------------------------------------------------------

// Routing imports
import LoggedOutRoute from "./LoggedOutRoute";
import LoggedInRoute from "./LoggedInRoute";

// Logged out pages
import Homepage from "./Homepage";
import Home from "./Home";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import Signup from "./Signup";

// User account-related pages
import UserSettings from "./UserSettings";
import UpdateProfile from "./UpdateProfile";

// Organisation pages
import ManageOrganisation from "./ManageOrganisation";

// Workflow pages
import Workflows from "./Workflows";
import KickstartWorkflow from "./KickstartWorkflow";
import NewWorkflow from "./NewWorkflow";

// Task pages
import Tasks from "./Tasks";
import ViewTask from "./ViewTask";

// Teams Pages
import Teams from "./Teams";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Core application.
 *
 * Imports all the variaous components of the Wurkflow application.
 *
 * @hideconstructor
 * @component
 */
function App() {
    return (
        <Container>
            <Router>
                <AuthProvider>
                    <StoreProvider>
                        <Switch>
                            {/* Home pages */}
                            <Route exact path="/" component={Homepage} />
                            <Route path="/home" component={Home} />

                            {/* Logged out pages */}
                            <LoggedOutRoute path="/login" component={Login} />
                            <LoggedOutRoute
                                path="/forgot-password"
                                component={ForgotPassword}
                            />
                            <LoggedOutRoute path="/signup" component={Signup} />

                            {/* User account-related pages */}
                            <LoggedInRoute
                                path="/user-settings"
                                component={UserSettings}
                            />
                            <LoggedInRoute
                                path="/update-profile"
                                component={UpdateProfile}
                            />

                            {/* Organisation pages */}
                            <LoggedInRoute
                                path="/manage-organisation"
                                component={ManageOrganisation}
                            />

                            {/* Workflow Pages */}
                            <LoggedInRoute
                                path="/workflows"
                                component={Workflows}
                            />
                            <LoggedInRoute
                                path="/kickstart-workflow"
                                component={KickstartWorkflow}
                            />
                            <LoggedInRoute
                                path="/new-workflow"
                                component={NewWorkflow}
                            />

                            {/* Task pages */}
                            <LoggedInRoute
                                exact
                                path={`/task/:id`}
                                component={ViewTask}
                            />
                            <LoggedInRoute path="/tasks" component={Tasks} />

                            {/* Team pages */}
                            <LoggedInRoute path="/teams" component={Teams} />
                        </Switch>
                    </StoreProvider>
                </AuthProvider>
            </Router>
        </Container>
    );
}

export default App;
