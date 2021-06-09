import { Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

import IntroPic from "../img/intro.png";
import TeamsPic from "../img/teams.png";
import TasksPic from "../img/tasks.png";

export default function LoggedOutHome() {
    return (
        <>
            <div className="px-4 my-5 text-center border-bottom">
                <h1 className="display-4">
                    <strong>Be ahead of the game</strong>
                </h1>

                <div className="col-lg-6 mx-auto">
                    <p className="lead mb-4">
                        Customise groups, delegate tasks and monitor deadlines. With Wurkflow, you
                        can now manage your team and the work to be done simulatenously! Never worry
                        about troublesome deadlines again.
                    </p>

                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                        <Link to="/signup">
                            <button className="btn btn-danger btn-lg px-4 mx-3 my-2">
                                Create Account
                            </button>
                        </Link>
                        <button className="btn btn-outline-danger btn-lg px-4 my-2">
                            See It In Action
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden" style={{ maxHeight: "30vh" }}>
                    <Container className="px-5">
                        <Image src={IntroPic} width={700} height={270} />
                    </Container>
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
                    <h1 className="display-5 fw-bold lh-1 mb-3">Groups</h1>
                    <p className="lead">
                        Begin your journey by joining a group - or creating them yourself. With
                        groups, delegation of work can now be done in a systematic and organised
                        way.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button className="btn btn-danger btn-lg px-4 me-md-2">See More</button>
                    </div>
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
                        Create tasks for your team and customise deadlines as you see fit! Let
                        Wurkflow notify the respective members as you sit back and monitor the task.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button className="btn btn-danger btn-lg px-4 me-md-2">Learn More</button>
                    </div>
                </div>
            </div>
        </>
    );
}
