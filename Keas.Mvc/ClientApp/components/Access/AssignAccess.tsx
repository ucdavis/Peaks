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

import * as moment from "moment";
import DatePicker from "react-datepicker";
import { AppContext, IAccess, IAccessAssignment } from "../../Types";
import AssignAccessList from "./AssignAccessList";
import SearchAccess from "./SearchAccess";

import 'react-datepicker/dist/react-datepicker.css';


interface IProps {
    onAssign: (access: IAccess, date: string) => Promise<IAccessAssignment>;
    assignedAccessList: string[];
}

interface IState {
  accessList: IAccess[];
  selectedAccess: IAccess;
  date: any;
  modal: boolean;
  loading: boolean;
  error: string;
  validState: boolean;
  validAccess: boolean;
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
      date: moment().add(3, 'y'),
      modal: false,
      loading: true,
      error: "",
      validState: false,
      validAccess: false,
    };
  }

  //clear everything out on close
  public closeModal = () => {
    this.setState({
        modal: false,
        selectedAccess: null,
        error: "",
        validAccess: false,
        validState: false,
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

    if (!this.state.validState) return;
    console.log("assign selected", this.state.selectedAccess);

    const accessAssignment = await this.props.onAssign(this.state.selectedAccess, this.state.date.format("YYYY MM DD").toString());

    this.setState({
      accessList: [...this.state.accessList, accessAssignment.access],
    });
    this.closeModal();
  };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
      console.log("selected in assign", access);
      //if this access is not already assigned
      //TODO: more validation of name
      if (access.name.length > 64)
      {
          this.setState({ selectedAccess: null, error: "The access name you have chosen is too long", validAccess: false }, this._validateState);
      }
      else if (this.props.assignedAccessList.findIndex(x => x == access.name) != -1)
      {
          this.setState({ selectedAccess: null, error: "The access you have chosen is already assigned to this user", validAccess: false }, this._validateState);
      }
      else
      {
          this.setState({ selectedAccess: access, error: "", validAccess: true }, this._validateState);
      }
  };

  private _onDeselected = () => {
      this.setState({ selectedAccess: null, error: "", validAccess: false }, this._validateState);
  }


  private _validateState = () => {
      let valid = true;
      if (this.state.selectedAccess == null)
          valid = false;
      else if (this.state.error != "")
          valid = false;
      this.setState({ validState: valid });

  }

  private _changeDate = (newDate) => {
      this.setState({ date: newDate });
  }

  public render() {
    // TODO: move datepicker into new component, try to make it look nice
    // TODO: only show step 2 if state.selectedAccess is truthy
    // TODO: use expiration date as part of assignment
    return (
      <div>
        <Button color="danger" onClick={this.openModal}>
          Add Access
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.closeModal} size="lg">
          <ModalHeader>Assign Access</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm">
                    <label>Pick an access to assign</label>
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
                    {this.state.validAccess &&
                        <div className="col-sm">
                                    <label>Set the expiration date</label>
                                    <DatePicker
                                        selected={this.state.date}
                                        onChange={this._changeDate}
                                    />
                        </div>}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
              <Button color="primary" onClick={this._assignSelected} disabled={!this.state.validState}>
              Go!
            </Button>{" "}
              <Button color="secondary" onClick={this.closeModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
