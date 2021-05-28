import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { Container, Form, Button, CardGroup, Card, Alert } from "react-bootstrap";

import PageHeader from "./PageHeader";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            history.push("/");
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}

                <Container className="d-flex align-items-center justify-content-center">
                    <CardGroup>
                        <Card className="d-flex p-4" style={{ minWidth: "300px" }}>
                            <Card.Title className="mb-4">Sign Up</Card.Title>
                            <Card.Text>
                                Don't have an account on Wurkflow yet? Get one today and start
                                speeding up your workflows!
                            </Card.Text>
                            <Link to="/signup">
                                <button className="btn btn-outline-secondary">Sign Up</button>
                            </Link>
                        </Card>

                        <Card className="p-4" style={{ minWidth: "400px" }}>
                            <Card.Title>Log In</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email" className="mt-4">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required />
                                </Form.Group>
                                <Form.Group id="password" className="mt-4">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" ref={passwordRef} required />
                                </Form.Group>
                                <Button disabled={loading} className="w-100 mt-4" type="submit">
                                    Log In
                                </Button>
                            </Form>
                            <div className="w-100 text-center mt-3">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>
                        </Card>
                    </CardGroup>
                </Container>
            </Container>
        </>
    );
}
