// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------

// React imports
import { useState, useEffect } from "react";

// Styling imports
import "react-big-calendar/lib/css/react-big-calendar.css";

// Page omponent imports
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
// ----------------------------------------------------------------------------

const locales = {
    "en-GB": require("date-fns/locale/en-GB"),
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

function CalendarView({ tasks }) {
    // ------------------------------------------------------------------------
    // GLOBAL DECLARATIONS
    // ------------------------------------------------------------------------

    // useState declarations
    const [events, setEvents] = useState([]);
    // ------------------------------------------------------------------------

    function updateEvents() {
        const tempEvents = [];
        if (tasks) {
            tasks.forEach((task) => {
                const tempEvent = {
                    title: task.name,
                    start: task.dueDate,
                    end: task.dueDate,
                    allDay: true,
                };
                tempEvents.push(tempEvent);
            });
            setEvents(tempEvents);
        }
    }

    useEffect(() => {
        updateEvents();
    }, [tasks]);

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                view="month"
                views={["month"]}
            />
        </div>
    );
}

export default CalendarView;
