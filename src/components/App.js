import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { StoreProvider } from "../contexts/StoreContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import LoggedOutRoute from "./LoggedOutRoute";
import LoggedInRoute from "./LoggedInRoute";
import Homepage from "./Homepage";
import Home from "./Home";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import Signup from "./Signup";
import UserSettings from "./UserSettings";
import UpdateProfile from "./UpdateProfile";
import ViewTask from "./ViewTask";
import ManageOrganisation from "./ManageOrganisation";

import Tasks from "./Tasks";
import Teams from "./Teams";

export default function App() {
    return (
        <Container>
            <Router>
                <AuthProvider>
                    <StoreProvider>
                        <Switch>
                            <Route exact path="/" component={Homepage} />
                            <Route path="/home" component={Home} />

                            <LoggedOutRoute path="/login" component={Login} />
                            <LoggedOutRoute path="/forgot-password" component={ForgotPassword} />
                            <LoggedOutRoute path="/signup" component={Signup} />

                            <LoggedInRoute path="/user-settings" component={UserSettings} />
                            <LoggedInRoute path="/update-profile" component={UpdateProfile} />

                            <LoggedInRoute exact path={`/task/:id`} component={ViewTask} />
                            <LoggedInRoute path="/tasks" component={Tasks} />

                            <LoggedInRoute path="/teams" component={Teams} />
                            <LoggedInRoute
                                path="/manage-organisation"
                                component={ManageOrganisation}
                            />
                        </Switch>
                    </StoreProvider>
                </AuthProvider>
            </Router>
        </Container>
    );
}
