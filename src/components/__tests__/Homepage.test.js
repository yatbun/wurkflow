import React from "react";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "@testing-library/jest-dom/extend-expect";
import Homepage from "../Homepage";
import Dashboard from "../Dashboard";
import LoggedOutHome from "../LoggedOutHome";
import * as AuthContext from "../../contexts/AuthContext";

configure({ adapter: new Adapter() });

let wrapper;

describe("Homepage", () => {
    beforeEach(() => {
        const currentUser = {};
        jest.spyOn(AuthContext, "useAuth").mockImplementation(() => currentUser);
        wrapper = shallow(<Homepage />);
    });

    it("should display LoggedOutHome if not logged in", () => {
        expect(wrapper.find(LoggedOutHome).length).toEqual(1);
    });

    it("should not display Dashboard if logged in", () => {
        expect(wrapper.find(Dashboard).length).toEqual(0);
    });
});
