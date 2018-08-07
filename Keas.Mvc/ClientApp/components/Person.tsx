import * as React from "react";

import AccessContainer from "./Access/AccessContainer";
import BioContainer from "./Biographical/BioContainer";
import EquipmentContainer from "./Equipment/EquipmentContainer";
import HistoryContainer from "./History/HistoryContainer";
import KeyContainer from "./Keys/KeyContainer";

import { IPerson } from "../Types";

interface IProps {
  person: IPerson;
}

export default class Person extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <KeyContainer person={this.props.person} />
        <AccessContainer person={this.props.person} />
        <EquipmentContainer person={this.props.person} />
        <HistoryContainer controller="people" id={this.props.person.id} />
      </div>
    );
  }
}
