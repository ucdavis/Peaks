import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ListGroup,
  ListGroupItem
} from "reactstrap";

import { AppContext, IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";
import SearchAccess from "./SearchAccess";

interface IProps {
  onAssign: (access: IAccess) => void;
  onCreate: (access: IAccess) => any;
}

interface IState {
  accessList: IAccess[];
  selectedAccess: IAccess;
  newAccessName: string;
  modal: boolean;
  loading: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object
  };
  public context: AppContext;

  constructor(props) {
    super(props);
    this.state = {
      accessList: [],
      newAccessName: "",
      selectedAccess: null,
      modal: false,
      loading: true
    };
  }

  public toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  public openModal = async () => {
    this.setState({ modal: true });
  };

  public createAccess = async () => {
    var newAccess = await this.props.onCreate({
      id: 0,
      name: this.state.newAccessName,
      teamId: this.context.person.teamId
    });
    // TODO: check for success

    this.setState({
      modal: false,
      accessList: [...this.state.accessList, newAccess]
    });
  };

  public assignAccess = async (access: IAccess) => {
    //TODO: avoid assigning something already assigned
    await this.props.onAssign(access);
    this.setState({ modal: false });
  };

  private _onChange = e => {
    this.setState({ newAccessName: e.target.value });
  };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
    console.log('selected', access);
    this.setState({ selectedAccess: access });
  };

  public render() {
    const assets = this.state.accessList.map(x => (
      <AssignAccessList
        key={x.id.toString()}
        onAssign={this.assignAccess}
        access={x}
      />
    ));
    return (
      <div>
        <Button color="danger" onClick={this.openModal}>
          Add Access
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader>Assign Access</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm">
                  <SearchAccess onSelect={this._onSelected} />
                </div>
                <div className="col-sm">Col1</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.createAccess}>
              Add & Assign New Access
            </Button>{" "}
            <Button color="secondary" onClick={this.toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
