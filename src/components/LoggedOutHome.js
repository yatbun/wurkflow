// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { Link } from "react-router-dom";

// Syling imports
import { Container, Image } from "react-bootstrap";

// Page component imports
import IntroPic from "../img/intro.png";
import WorkflowsPic from "../img/workflows.png";
import TeamsPic from "../img/teams.png";
import TasksPic from "../img/tasks.png";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * The landing page and the homepage when the user is not logged in.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function LoggedOutHome() {
    return (
        <>
            <div className="px-4 my-5 text-center border-bottom">
                <h1 className="display-4">
                    <strong>Be ahead of the game</strong>
                </h1>

                <div className="col-lg-6 mx-auto">
                    <p className="lead mb-4">
                        Customise groups, delegate tasks and monitor deadlines.
                        With Wurkflow, you can now manage your team and the work
                        to be done simulatenously! Never worry about troublesome
                        deadlines again.
                    </p>

                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                        <Link to="/signup">
                            <button className="btn btn-danger btn-lg px-4 mx-3 my-2">
                                Create Account
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="btn btn-outline-danger btn-lg px-4 my-2">
                                Log In
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden" style={{ maxHeight: "30vh" }}>
                    <Container className="px-5">
                        <Image
                            src={IntroPic}
                            width={700}
                            height={400}
                            className="shadow-lg"
                        />
                    </Container>
                </div>
            </div>

            <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">
                    <Image
                        src={WorkflowsPic}
                        width={500}
                        height={270}
                        className="border shadow-lg rounded"
                    />
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold lh-1 mb-3">Workflows</h1>
                    <p className="lead">
                        Customize your projects with our new Workflow feature.
                        Templates can be created and managed for future use!
                        Begin by clicking on Kickstart Workflow and you're off
                        to go.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start"></div>
                </div>
            </div>

            {/* <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                <div className="p-3">
                    <h1 className="display-4 fw-bold lh-1 mb-4">See what others say</h1>
                    <p className="lead mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu dui semper,
                        volutpat velit non, sagittis ex. Vivamus elementum dui diam, ac pharetra
                        augue sodales id. Pellentesque id arcu diam. Vestibulum fermentum justo
                        sapien, quis viverra dolor feugiat ac. Ut vitae lacus mi.
                    </p>
                </div>
            </div> */}

            <div className="row flex-lg-row align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">
                    <Image
                        src={TasksPic}
                        width={500}
                        height={270}
                        className="border shadow-lg rounded"
                    />
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold lh-1 mb-3">Tasks</h1>
                    <p className="lead">
                        Create tasks for your team and customise deadlines as
                        you see fit! Let Wurkflow notify the respective members
                        as you sit back and monitor the task.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start"></div>
                </div>
            </div>

            <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">
                    <Image
                        src={TeamsPic}
                        width={500}
                        height={270}
                        className="border shadow-lg rounded"
                    />
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold lh-1 mb-3">Teams</h1>
                    <p className="lead">
                        Begin your journey by joining a team - or creating them
                        yourself. With teams, delegation of work can now be done
                        in a systematic and organised way.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start"></div>
                </div>
            </div>
        </>
    );
}

export default LoggedOutHome;
