import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import LoggedInRoute from "./LoggedInRoute";
import LoggedOutRoute from "./LoggedOutRoute";
import Homepage from "./Homepage";
import Login from "./Login";
import Signup from "./Signup";
import UpdateProfile from "./UpdateProfile";

export default function App() {
    return (
        <Container>
            <Router>
                <AuthProvider>
                    <Switch>
                        <Route exact path="/" component={Homepage} />
                        <LoggedOutRoute path="/login" component={Login} />
                        <LoggedOutRoute path="/signup" component={Signup} />
                        <LoggedInRoute path="/update-profile" component={UpdateProfile} />
                    </Switch>
                </AuthProvider>
            </Router>
        </Container>
    );
}
