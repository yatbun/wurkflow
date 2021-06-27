import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Dashboard from "../Dashboard";
import { AuthContext } from "../../contexts/AuthContext";
import { StoreContext } from "../../contexts/StoreContext";

const currentUser = {
    displayName: "James",
};

const tasks = [1, 2, 3, 4];

describe("Dashboard", () => {
    it("should display user's name and number of tasks", () => {
        render(
            <StoreContext.Provider value={{ tasks }}>
                <AuthContext.Provider value={{ currentUser }}>
                    <Dashboard />
                </AuthContext.Provider>
            </StoreContext.Provider>
        );

        const dashBoardElement1 = screen.getByTestId("Dashboard-name");
        expect(dashBoardElement1).toHaveTextContent("Welcome, James");

        const dashBoardElement2 = screen.getByTestId("Dashboard-task");
        expect(dashBoardElement2).toHaveTextContent("You have 4 ongoing tasks.");
    });
});
