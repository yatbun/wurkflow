// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// Styling imports
import {
    Container,
    InputGroup,
    FormControl,
    Button,
    Row,
    Col,
} from "react-bootstrap";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page conponent imports
import PageHeader from "./PageHeader";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The page for users to manage the organisation that they are owners of.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function ManageOrganisation() {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // Context declarations
    const { userData } = useStore();
    const history = useHistory();

    // useState declarations
    const [currentOrg, setCurrentOrg] = useState(null);
    // ------------------------------------------------------------------------

    /**
     * Render function for the organisation management interface.
     * @returns {Component} The organisation management interface.
     */
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
                                <FormControl
                                    type="text"
                                    value={currentOrg.uid}
                                />
                                <InputGroup.Append>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={(e) => {
                                            navigator.clipboard.writeText(
                                                currentOrg.uid
                                            );
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

    /**
     * Gets the current active organisation of the user.
     *
     * @returns {void}
     */
    async function getCurrentOrg() {
        const res = await userData.orgAdmin.get();
        const temp = res.data();
        temp.uid = res.id;
        setCurrentOrg(temp);
    }

    // ------------------------------------------------------------------------
    // useEffect Hooks
    // ------------------------------------------------------------------------

    // Redirects the user to the homepage if they are not an owner of an
    // organisation.
    useEffect(() => {
        if (userData && userData.orgAdmin) {
            getCurrentOrg();
        } else {
            history.push("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);
    // ------------------------------------------------------------------------

    return (
        <>
            <PageHeader />
            <Container className="pt-5 mt-5">
                {currentOrg !== null ? renderOrg() : <h1></h1>}
            </Container>
        </>
    );
}

export default ManageOrganisation;
