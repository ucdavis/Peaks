import * as React from "react";

import BioDetail from './Biographical/BioDetail';
import { IPerson } from "./PersonContainer";

interface IProps {
  person: IPerson;
}

export default class Person extends React.Component<IProps, {}> {
  public render() {
    return (
        <div>
            <BioDetail person={this.props.person} />
        </div>
    );
  }
}
