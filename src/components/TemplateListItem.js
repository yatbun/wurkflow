import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";
import { DateLocalizer } from "react-widgets/IntlLocalizer";
import { Container, Button, Form, InputGroup, FormControl, Spinner } from "react-bootstrap";

import Localization from "react-widgets/esm/Localization";
import DatePicker from "react-widgets/DatePicker";

export default function TemplateListItem({ template }) {
    const history = useHistory();

    const tp = template.data();
    const instanceNameRef = useRef();
    const { createWorkflow } = useStore();
    const [loading, setLoading] = useState(false);
    const [wfDate, setWfDate] = useState(new Date());

    async function handleStart(e) {
        e.preventDefault();
        setLoading(true);

        await createWorkflow(instanceNameRef.current.value, tp.desc, tp.team, wfDate, tp.data);

        instanceNameRef.current.value = "";
        setLoading(false);
        history.push("/workflows");
    }

    return (
        <Container className="my-5 px-5 py-4 border rounded">
            <h4>{tp.name}</h4>
            <p>{tp.desc}</p>
            <Form onSubmit={handleStart} className="mt-4">
                <Localization date={new DateLocalizer({ culture: "en-GB", firstOfWeek: 7 })}>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon3">Final Due Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <DatePicker
                            value={wfDate}
                            onSelect={(val) => setWfDate(val)}
                            valueEditFormat={{ dateStyle: "short" }}
                            valueDisplayFormat={{ dateStyle: "medium" }}
                        />
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <FormControl placeholder="Instance name" ref={instanceNameRef} required />
                        <InputGroup.Append>
                            <Button variant="outline-primary" type="submit" disabled={loading}>
                                Kickstart Workflow
                                {loading && (
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="mx-2"
                                    />
                                )}
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Localization>
            </Form>
        </Container>
    );
}
