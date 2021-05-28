import { useAuth } from "../contexts/AuthContext";
import { Container } from "react-bootstrap";

import PageHeader from "./PageHeader";
import Dashboard from "./Dashboard";
import LoggedOutHome from "./LoggedOutHome";

export default function Homepage() {
    const { currentUser } = useAuth();

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {currentUser ? <Dashboard /> : <LoggedOutHome />}
            </Container>
        </>
    );
}
