import PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { AppContext, IKey, IPerson } from "../../Types";
import AssignPerson from "../Biographical/AssignPerson";

interface IProps {
  onCreate: (key: IKey, person: IPerson) => void;
}

interface IState {
  modal: boolean;
  person: IPerson;
}

export default class AssignKey extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      person: null
    };
  }

  public toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  public createKey = async () => {
    const person = this.context.person
      ? this.context.person
      : this.state.person;

    const key = {
      id: 0,
      name: "newkey" + new Date().getUTCSeconds(),
      serialNumber: "SN123",
      teamId: 1
    };

    await this.props.onCreate(key, person);

    // TODO: check for success
    this.setState({ modal: false });
  };
  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.toggle}>
          Add Key
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader>Assign Key</ModalHeader>
          <ModalBody>
            <form>
              <div className="form-group">
                <label htmlFor="assignto">Assign To</label>
                <AssignPerson onSelect={this._onSelect} />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.createKey}>
              Add & Assign New Key
            </Button>{" "}
            <Button color="secondary" onClick={this.toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _onSelect = (person: IPerson) => {
    this.setState({ person });
  };
}
