import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { Container } from "react-bootstrap";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { tasks } = useStore();

    return (
        <>
            <Container className="d-flex flex-column">
                <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                    <h1>Welcome, {currentUser.displayName}!</h1>
                    <h4>You have {tasks.length} ongoing tasks.</h4>
                </Container>
            </Container>
        </>
    );
}
