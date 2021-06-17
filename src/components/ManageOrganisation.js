import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";

import { Container, InputGroup, FormControl, Button, Row, Col } from "react-bootstrap";
import PageHeader from "./PageHeader";

export default function ManageOrganisation() {
    const { userData } = useStore();
    const history = useHistory();
    const [currentOrg, setCurrentOrg] = useState(null);

    const renderOrg = () => {
        return (
            <Container className="d-flex flex-column">
                <Container className="col-sm-12 mx-auto bg-light p-5 rounded">
                    <Row>
                        <h1>Manage {currentOrg.name}</h1>
                    </Row>
                    <Row>
                        <Col lg="6">
                            <InputGroup className="mt-4">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>OrgCode: </InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl type="text" value={currentOrg.uid} />
                                <InputGroup.Append>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={(e) => {
                                            navigator.clipboard.writeText(currentOrg.uid);
                                        }}
                                    >
                                        Copy Code!
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </Container>
        );
    };

    async function getCurrentOrg() {
        const res = await userData.orgAdmin.get();
        const temp = res.data();
        temp.uid = res.id;
        setCurrentOrg(temp);
    }

    useEffect(() => {
        if (userData && userData.orgAdmin) {
            getCurrentOrg();
        } else {
            history.push("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {currentOrg !== null ? renderOrg() : <h1></h1>}
            </Container>
        </>
    );
}
