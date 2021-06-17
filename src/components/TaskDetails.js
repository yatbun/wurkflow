import React, { useState, useEffect } from "react";
import { Container, Alert, Row, Col, Badge, ListGroup } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import PageHeader from "./PageHeader";
import { useStore } from "../contexts/StoreContext";

export default function TaskDetails() {
    const [error, setError] = useState("");
    const { tasks, getNames, userNames } = useStore();
    const { id, index } = useParams();
    const data = tasks[index];

    // Loads userNames from StoreContext (only renders once)
    useEffect(() => {
        getNames(id);
    }, []);

    const renderTask = () => {
        if (tasks && tasks.length === 0) {
            return "Loading";
        } else {
            return (
                <Container className="pt-5 mt-5">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Container className="d-flex flex-column">
                        <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                            <Link
                                className="position-absolute text-muted"
                                style={{ color: "black", top: 3, left: "96%" }}
                            >
                                {" "}
                                <p>Edit</p>{" "}
                            </Link>
                            <h1>
                                {" "}
                                {data.name}{" "}
                                {data.completed ? (
                                    <Badge variant="success" className="align-top my-2 mx-3">
                                        {" "}
                                        <h6 className="my-0"> Completed </h6>{" "}
                                    </Badge>
                                ) : (
                                    <Badge variant="warning" className="align-middle my-2 mx-3">
                                        {" "}
                                        <h6 className="my-0"> In Progress </h6>{" "}
                                    </Badge>
                                )}
                            </h1>
                            <p class="mx-1"> {data.desc} </p>
                        </Container>

                        <Container className="my-4">
                            <Row>
                                <Col>
                                    <h5> Checklist </h5>
                                </Col>

                                <Col>
                                    <h5> Users involved </h5>
                                    <ListGroup variant="secondary">
                                        {userNames.length === 0
                                            ? "Loading"
                                            : userNames.map((name, index) =>
                                                  index === 0 ? (
                                                      <ListGroup.Item variant="secondary">
                                                          <Row>
                                                              <Col> {name} </Col>
                                                              <Col className="text-right font-weight-bold">
                                                                  Creator
                                                              </Col>
                                                          </Row>
                                                      </ListGroup.Item>
                                                  ) : (
                                                      <ListGroup.Item variant="light">
                                                          {" "}
                                                          {name}{" "}
                                                      </ListGroup.Item>
                                                  )
                                              )}
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Container>
                    </Container>
                </Container>
            );
        }
    };

    return (
        <div>
            <PageHeader />
            {renderTask()}
        </div>
    );
}
