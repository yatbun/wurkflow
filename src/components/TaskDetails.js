import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { CircularProgressbar } from "react-circular-progressbar";
import { useParams } from "react-router-dom";
import PageHeader from "./PageHeader";
import { useStore } from "../contexts/StoreContext";

export default function TaskDetails() {
    const { tasks, getUniqueTask } = useStore();
    const { id, index } = useParams();
    const data = tasks[index];
    console.log(tasks);
    const datas = getUniqueTask(id);

    return (
        <div>
            <PageHeader />
            <Container className="py-5 my-5">
                {/*
                        <h1> Task Details - {data.name} </h1>
                        <li> Status: {data.completed ? "Completed" : "In Progress"}</li>
                        <li>{data.desc}</li>
                        */}
                <h1 class="mx-1"> Task Details </h1>
                <Container className="my-4">
                    <Row>
                        <Col>
                            <h6>
                                <small class="text-muted"> Status: </small>
                                ...
                            </h6>
                        </Col>
                        <Col>
                            <h6>
                                <small class="text-muted"> Date Created: </small>
                                ...
                            </h6>
                        </Col>
                        <Col>
                            <h6>
                                <small class="text-muted"> Deadline: </small>
                                ...
                            </h6>
                        </Col>
                    </Row>
                    <Container className="col-sm-12 bg-light p-5 rounded ">
                        <div className="mx-5" style={{ width: 130, height: 130 }}>
                            <CircularProgressbar value={100} text="100%" />
                        </div>
                        {/*
                    <Card
                        body
                        bg="success"
                        text="white"
                        className="mx-4 text-center my-3"
                        style={{ width: "12rem" }}
                    >
                        {" "}
                        Task is completed!{" "}
                    </Card>
                    */}
                    </Container>
                </Container>
                <Container>
                    <h5> List of actions </h5>
                    ...
                </Container>
            </Container>
        </div>
    );
}
