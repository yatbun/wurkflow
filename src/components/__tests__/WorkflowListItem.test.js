import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import * as StoreContext from "../../contexts/StoreContext";
import WorkflowListItem from "../WorkflowListItem";

const workflow = {
    data() {
        return {
            name: "wfName",
            desc: "wfDesc",
        };
    },
};

const refreshFn = jest.fn();

describe("Homepage", () => {
    beforeEach(() => {
        const deleteWorkflow = jest.fn();
        jest.spyOn(StoreContext, "useStore").mockImplementation(() => deleteWorkflow);
        render(<WorkflowListItem workflow={workflow} refreshFn={refreshFn} />);
    });

    it("should correctly display workflow name", () => {
        const element = screen.getByTestId("wfName");
        expect(element).toHaveTextContent("wfName");
    });

    it("should correctly display workflow description", () => {
        const element = screen.getByTestId("wfDesc");
        expect(element).toHaveTextContent("wfDesc");
    });
});
