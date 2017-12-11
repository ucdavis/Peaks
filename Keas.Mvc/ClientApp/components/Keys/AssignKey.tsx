import * as React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { IKey } from "../../Types";

interface IProps {
  onCreate: (key: IKey) => void;
}

interface IState {
  modal: boolean;
}

export default class AssignKey extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }
  async createKey() {
    await this.props.onCreate({
      id: 0,
      name: "newkey" + new Date().getUTCSeconds(),
      teamId: 1,
      serialNumber: "SN123"
    });
    // TODO: check for success
    this.setState({ modal: false });
  }
  public render() {
    return (
      <div>
        <Button color="danger" onClick={() => this.toggle()}>
          Add Key
        </Button>
        <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
          <ModalHeader>Assign Key</ModalHeader>
          <ModalBody>This will assign a new key</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.createKey()}>
              Add & Assign New Key
            </Button>{" "}
            <Button color="secondary" onClick={() => this.toggle()}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
