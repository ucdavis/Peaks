import * as React from "react";

import AccessContainer from "./Access/AccessContainer";
import BioContainer from "./Biographical/BioContainer";
import EquipmentContainer from "./Equipment/EquipmentContainer";
import KeyContainer from "./Keys/KeyContainer";

import { IPerson } from "../Types";

interface IProps {
  person: IPerson;
}

export default class Person extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <BioContainer person={this.props.person} />
        <KeyContainer person={this.props.person} />
        <AccessContainer person={this.props.person} />
        <EquipmentContainer person={this.props.person} />
      </div>
    );
  }
}
