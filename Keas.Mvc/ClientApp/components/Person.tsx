import * as React from "react";

import BioContainer from "./Biographical/BioContainer";
import KeyContainer from "./Keys/KeyContainer";
import AccessContainer from "./Access/AccessContainer";

import { IPerson } from "../Types";

interface IProps {
    person: IPerson;
}

export default class Person extends React.Component<IProps, {}> {
    public render() {
        return (
            <div>
                <BioContainer />
                <KeyContainer />
                <AccessContainer />
            </div>
        );
    }
}
