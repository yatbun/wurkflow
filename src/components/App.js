import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { StoreProvider } from "../contexts/StoreContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import LoggedOutRoute from "./LoggedOutRoute";
import LoggedInRoute from "./LoggedInRoute";
import Homepage from "./Homepage";
import Login from "./Login";
import Signup from "./Signup";
import UpdateProfile from "./UpdateProfile";

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
                            <LoggedOutRoute path="/login" component={Login} />
                            <LoggedOutRoute path="/signup" component={Signup} />
                            <LoggedInRoute path="/update-profile" component={UpdateProfile} />

                            <LoggedInRoute path="/tasks" component={Tasks} />
                            <LoggedInRoute path="/teams" component={Teams} />
                        </Switch>
                    </StoreProvider>
                </AuthProvider>
            </Router>
        </Container>
    );
}
