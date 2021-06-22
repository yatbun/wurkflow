import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { Container } from "react-bootstrap";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { tasks } = useStore();

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
