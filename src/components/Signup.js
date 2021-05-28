import { useRef, useState } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

import PageHeader from "./PageHeader";

export default function Signup() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            await signup(nameRef.current.value, emailRef.current.value, passwordRef.current.value);
            history.push("/");
        } catch (e) {
            setError("Failed to create an account. " + e.message);
        }

        setLoading(false);
    }

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Container className="d-flex align-items-center justify-content-center">
                    <Card className="p-4" style={{ minWidth: "400px" }}>
                        <Card.Title>Sign Up</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="name" className="mt-4">
                                <Form.Label>Display Name</Form.Label>
                                <Form.Control type="text" ref={nameRef} required />
                            </Form.Group>

                            <Form.Group id="email" className="mt-4">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" ref={emailRef} required />
                            </Form.Group>

                            <Form.Group id="password" className="mt-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" ref={passwordRef} required />
                            </Form.Group>

                            <Form.Group id="password-confirm" className="mt-4">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control type="password" ref={passwordConfirmRef} required />
                            </Form.Group>
                            <Button disabled={loading} className="w-100 mt-4" type="submit">
                                Sign Up
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            Already have an account? <Link to="/login">Log In</Link>.
                        </div>
                    </Card>
                </Container>
            </Container>
        </>
    );
}
