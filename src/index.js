// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import React from "react";
import ReactDOM from "react-dom";

// Styling imports
import "react-widgets/styles.css";

// Main app import
import App from "./components/App";
// ----------------------------------------------------------------------------

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
