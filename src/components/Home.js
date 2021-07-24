// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { Redirect } from "react-router-dom";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Wrapper page for the homepage. For redirecting purposes.
 *
 * @category Pages
 * @hideconstructor
 * @component
 */
function Home() {
    return <Redirect to="/" />;
}

export default Home;
