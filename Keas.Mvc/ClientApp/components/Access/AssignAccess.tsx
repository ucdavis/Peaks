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
import CreateAccess from "./CreateAccess";
import SearchAccess from "./SearchAccess";

interface IProps {
  onAssign: (access: IAccess) => void;
  onCreate: (access: IAccess) => any;
}

interface IState {
  accessList: IAccess[];
  selectedAccess: IAccess;
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

  // assign the selected access even if we have to create it
  private _assignSelected = async () => {
    console.log('assign selected', this.state.selectedAccess);

    if (!this.state.selectedAccess) return;

    let access = this.state.selectedAccess;

    // create new access if we need to
    if (access.id === 0) {
      access.teamId = this.context.person.teamId; // give the access the team of the current person
      access = await this.props.onCreate(access);
    }

    // assign it
    await this.props.onAssign(access);

    this.setState({
      modal: false,
      accessList: [...this.state.accessList, access]
    });
  };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
    console.log("selected", access);
    this.setState({ selectedAccess: access });
  };

  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.openModal}>
          Add Access
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} size="lg">
          <ModalHeader>Assign Access</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm">
                  <SearchAccess onSelect={this._onSelected} />
                </div>
                <div className="col-sm">
                  <CreateAccess onSelect={this._onSelected} />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => {}}>
              Go!
            </Button>{" "}
            <Button color="secondary" onClick={this.toggle}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
