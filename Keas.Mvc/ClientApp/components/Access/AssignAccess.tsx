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

import { AppContext, IAccess, IAccessAssignment } from "../../Types";
import AssignAccessList from "./AssignAccessList";
import SearchAccess from "./SearchAccess";

interface IProps {
    onAssign: (access: IAccess) => Promise<IAccessAssignment>;
    assignedAccessList: string[];
}

interface IState {
  accessList: IAccess[];
  selectedAccess: IAccess;
  modal: boolean;
  loading: boolean;
  error: string;
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
      loading: true,
      error: "",
    };
  }

  public toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  public openModal = async () => {
      this.setState({ modal: true, loading: true });
      const accessList: IAccess[] = await this.context.fetch(
          `/access/listteamaccess?teamId=${this.context.person.teamId}`
      );
      this.setState({ accessList: accessList, loading: false });
  };

  // assign the selected access even if we have to create it
  private _assignSelected = async () => {
    console.log("assign selected", this.state.selectedAccess);

    if (!this.state.selectedAccess) return;

    const accessAssignment = await this.props.onAssign(this.state.selectedAccess);

    this.setState({
      modal: false,
      accessList: [...this.state.accessList, accessAssignment.access]
    });
  };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
      console.log("selected", access);
      //if this access is not already assigned
      if (this.props.assignedAccessList.findIndex(x => x == access.name) == -1)
      {
          this.setState({ selectedAccess: access, error: "" });
      }
      else
      {
          console.log("already selected");
          this.setState({ error: "This access is already assigned" });
      }
  };

  private _onDeselected = () => {
      this.setState({ selectedAccess: null, error: "" });
  }

  public render() {

      const canSubmit = this.state.error == "" && !this.state.loading;
    // TODO: move datepicker into new component, try to make it look nice
    // TODO: only show step 2 if state.selectedAccess is truthy
    // TODO: use expiration date as part of assignment
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
                    <SearchAccess
                        accessList={this.state.accessList}
                        loading={this.state.loading}
                        onSelect={this._onSelected}
                        onDeselect={this._onDeselected} />
                    {this.state.error}
                </div>
              </div>
              <div>
                <div className="row">
                <div className="col-sm">
                  <h3>Step 2: Assign it</h3>
                  <form>
                    <label>Set Expiration Date</label>
                    <input type="date" className="form-control" />
                  </form>
                </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
              <Button color="primary" onClick={this._assignSelected} disabled={canSubmit}>
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
