// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";

// Styling imports
import {
    Container,
    Button,
    Form,
    InputGroup,
    FormControl,
    Spinner,
} from "react-bootstrap";

// Context imports
import { useStore } from "../contexts/StoreContext";

// Page component imports
import DatePicker from "react-widgets/DatePicker";

// Misc imports
import { DateLocalizer } from "react-widgets/IntlLocalizer";
import Localization from "react-widgets/esm/Localization";

/**
 * @classdesc
 * List display of an individual workflow template.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function TemplateListItem({ template }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    const tp = template.data();

    // Context declarations
    const { createWorkflow } = useStore();
    const history = useHistory();

    // useState declarations
    const [loading, setLoading] = useState(false);
    const [wfDate, setWfDate] = useState(new Date());

    // Misc declarations
    const instanceNameRef = useRef();
    // ------------------------------------------------------------------------

    /**
     * Handles the kickstarting of an instance of a workflow template.
     *
     * @param {Event} e The `onClick` event from the Start button
     * @returns {void}
     */
    async function handleStart(e) {
        e.preventDefault();
        setLoading(true);

        await createWorkflow(
            instanceNameRef.current.value,
            tp.desc,
            tp.team,
            wfDate,
            tp.data
        );

        instanceNameRef.current.value = "";
        setLoading(false);
        history.push("/workflows");
    }

    return (
        <Container className="my-5 px-5 py-4 border rounded">
            <h4>{tp.name}</h4>
            <p>{tp.desc}</p>
            <Form onSubmit={handleStart} className="mt-4">
                <Localization
                    date={
                        new DateLocalizer({ culture: "en-GB", firstOfWeek: 7 })
                    }
                >
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon3">
                                Final Due Date
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <DatePicker
                            value={wfDate}
                            onSelect={(val) => setWfDate(val)}
                            valueEditFormat={{ dateStyle: "short" }}
                            valueDisplayFormat={{ dateStyle: "medium" }}
                        />
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <FormControl
                            placeholder="Instance name"
                            ref={instanceNameRef}
                            required
                        />
                        <InputGroup.Append>
                            <Button
                                variant="outline-primary"
                                type="submit"
                                disabled={loading}
                            >
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

export default TemplateListItem;
