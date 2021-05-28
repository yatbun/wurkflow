import { Container } from "react-bootstrap";
import { CustomPlaceholder } from "react-placeholder-image";

export default function LoggedOutHome() {
    return (
        <>
            <div className="px-4 my-5 text-center border-bottom">
                <h1 className="display-4 fw-bold">Improve your workflow!</h1>

                <div className="col-lg-6 mx-auto">
                    <p className="lead mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu dui semper,
                        volutpat velit non, sagittis ex. Vivamus elementum dui diam, ac pharetra
                        augue sodales id. Pellentesque id arcu diam. Vestibulum fermentum justo
                        sapien, quis viverra dolor feugiat ac. Ut vitae lacus mi.
                    </p>

                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                        <button className="btn btn-danger btn-lg px-4 me-sm-3">Learn More</button>
                        <button className="btn btn-outline-danger btn-lg px-4">
                            See It In Action
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden" style={{ maxHeight: "30vh" }}>
                    <Container className="px-5">
                        <CustomPlaceholder
                            className="border rounded-3 shadow-lg mb-4"
                            width={700}
                            height={400}
                            text="Screenshot here"
                        />
                    </Container>
                </div>
            </div>

            <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">
                    <CustomPlaceholder
                        className="d-block mx-lg-auto"
                        width={500}
                        height={300}
                        text="Screenshot"
                    />
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold lh-1 mb-3">Feature 1</h1>
                    <p className="lead">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu dui semper,
                        volutpat velit non, sagittis ex. Vivamus elementum dui diam, ac pharetra
                        augue sodales id. Pellentesque id arcu diam. Vestibulum fermentum justo
                        sapien, quis viverra dolor feugiat ac. Ut vitae lacus mi.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button className="btn btn-danger btn-lg px-4 me-md-2">Learn More</button>
                    </div>
                </div>
            </div>

            <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                <div className="p-3">
                    <h1 className="display-4 fw-bold lh-1 mb-4">See what others say</h1>
                    <p className="lead mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu dui semper,
                        volutpat velit non, sagittis ex. Vivamus elementum dui diam, ac pharetra
                        augue sodales id. Pellentesque id arcu diam. Vestibulum fermentum justo
                        sapien, quis viverra dolor feugiat ac. Ut vitae lacus mi.
                    </p>
                </div>
            </div>

            <div className="row flex-lg-row align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">
                    <CustomPlaceholder
                        className="d-block mx-lg-auto"
                        width={500}
                        height={300}
                        text="Screenshot"
                    />
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold lh-1 mb-3">Feature 2</h1>
                    <p className="lead">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu dui semper,
                        volutpat velit non, sagittis ex. Vivamus elementum dui diam, ac pharetra
                        augue sodales id. Pellentesque id arcu diam. Vestibulum fermentum justo
                        sapien, quis viverra dolor feugiat ac. Ut vitae lacus mi.
                    </p>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button className="btn btn-danger btn-lg px-4 me-md-2">Learn More</button>
                    </div>
                </div>
            </div>
        </>
    );
}
