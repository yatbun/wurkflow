// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// Styling imports
import { Table } from "react-bootstrap";

// Page component imports
import TaskTableItem from "./TaskTableItem";
// ----------------------------------------------------------------------------

/**
 * @classdesc
 * Table view of tasks.
 *
 * @category Page Components
 * @hideconstructor
 * @component
 */
function TaskTableView({ tasks }) {
    return (
        <Table striped bordered hover responsive className="mt-3">
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Date Due</th>
                    <th>Team</th>
                    <th style={{ minWidth: "150px" }}>Actions</th>
                </tr>
            </thead>

            <tbody>
                {tasks.map((task, index) => (
                    <TaskTableItem task={task} index={index} key={index} />
                ))}
            </tbody>
        </Table>
    );
}

export default TaskTableView;
