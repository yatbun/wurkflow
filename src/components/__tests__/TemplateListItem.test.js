import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import * as StoreContext from "../../contexts/StoreContext";
import TemplateListItem from "../TemplateListItem";

const template = {
    data() {
        return {
            name: "templateName",
            desc: "templateDesc",
        };
    },
};

describe("Homepage", () => {
    beforeEach(() => {
        const createWorkflow = jest.fn();
        jest.spyOn(StoreContext, "useStore").mockImplementation(() => createWorkflow);
        render(<TemplateListItem template={template} />);
    });

    it("should correctly display template name", () => {
        const element = screen.getByTestId("templateName");
        expect(element).toHaveTextContent("templateName");
    });

    it("should correctly display template description", () => {
        const element = screen.getByTestId("templateDesc");
        expect(element).toHaveTextContent("templateDesc");
    });
});
