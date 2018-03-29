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
import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";
import AssignPerson from "../Biographical/AssignPerson";
import AccessEditValues from "./AccessEditValues";
import SearchAccess from "./SearchAccess";

import 'react-datepicker/dist/react-datepicker.css';

interface IProps {
    closeModal: () => void;
    modal: boolean;
    onCreate: (access: IAccess, date: any, person: IPerson) => void;
    onRevoke: (access: IAccess, person: IPerson) => void;
    onAddNew: () => void;
    person?: IPerson;
    revoking: boolean;
    selectedAccess: IAccess;
}

interface IState {
  access: IAccess;
  date: any;
  error: string;
  person: IPerson;
  validState: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
  public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      access: this.props.selectedAccess,
      date: moment().add(3, 'y'),
      error: "",
      person: null,
      validState: false,
    };
    }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
      if (nextProps.selectedAccess !== this.props.selectedAccess) {
          this.setState({ access: nextProps.selectedAccess });
      }

      if (nextProps.person !== this.props.person) {
          this.setState({ person: nextProps.person });
      }
  }

  public render() {
      return (
          <div>
              <Button color="danger" onClick={this.props.onAddNew}>
                  Add Access
        </Button>
              <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
                  <ModalHeader>Assign Access</ModalHeader>
                  <ModalBody>
                      <div className="container-fluid">
                          <form>
                              <div className="form-group">
                                  <label htmlFor="assignto">Assign To</label>
                                  <AssignPerson
                                      person={this.props.person || this.state.person}
                                      onSelect={this._onSelectPerson} />
                              </div>

                              <div className="form-group">
                                  <label>Pick an access to assign</label>
                                  <SearchAccess
                                      selectedAccess={this.state.access}
                                      onSelect={this._onSelected}
                                      onDeselect={this._onDeselected} />
                              </div>
                              {!this.props.selectedAccess || !this.props.selectedAccess.teamId && //if we are creating a new access, edit properties
                                  <AccessEditValues
                                  selectedAccess={this.props.selectedAccess}
                                  changeProperty={this._changeProperty}
                                  disableEditing={false} />
                              }
                              {this.props.selectedAccess && !!this.props.selectedAccess.teamId &&
                                  <AccessEditValues
                                  selectedAccess={this.props.selectedAccess}
                                  disableEditing={true} />
                              }

                              {!this.props.revoking && (this.state.person !== null || this.props.person !== null) &&
                                  <div className="form-group">
                                      <label>Set the expiration date</label>
                                      <DatePicker
                                          selected={this.state.date}
                                          onChange={this._changeDate}
                                          onChangeRaw={this._changeDateRaw}
                                          className="form-control"
                                      />
                                  </div>}
                              {this.state.error}
                          </form>
                      </div>
                  </ModalBody>
                  <ModalFooter>
                      {!this.props.revoking &&
                          <Button color="primary" onClick={this._assignSelected} disabled={!this.state.validState}>
                              Assign
                </Button>}
                      {this.props.revoking &&
                          <Button color="primary" onClick={this._revokeSelected} disabled={!this.state.validState}>
                              Revoke
                </Button>}
                      {" "}
                      <Button color="secondary" onClick={this._closeModal}>
                          Close
            </Button>
                  </ModalFooter>
              </Modal>
          </div>
      );
  }

  private _changeProperty = (property: string, value: string) => {
      this.setState({
          access: {
              ...this.state.access,
              [property]: value
          }
      });
  };

  //clear everything out on close
  private _closeModal = () => {
      this.setState({
        access:null,
        error: "",
        validState: false,
        person: null,
      });
      this.props.closeModal();
  };

  // assign the selected access even if we have to create it
  private _assignSelected = async () => {

    if (!this.state.validState) {
        return;
    }

    const person = this.props.person ? this.props.person : this.state.person;

    await this.props.onCreate(this.state.access, this.state.date.format(), person);

    this._closeModal();
  };

  private _revokeSelected = async () => {
    if (!this.state.validState) {
        return;
    }
    const person = this.props.person ? this.props.person : this.state.person;

    await this.props.onRevoke(this.state.access, person);

    this._closeModal();
    };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
      console.log("selected in assign", access);
      //if this access is not already assigned

      //TODO: more validation of name
      if (access.name.length > 64)
      {
          this.setState({
              access: null,
              error: "The access name you have chosen is too long"
          },
              this._validateState);
      }
      //else if (this.props.assignedAccessList.findIndex(x => x == access.name) != -1)
      //{
      //    this.setState({ selectedAccess: null, error: "The access you have chosen is already assigned to this user", validAccess: false }, this._validateState);
      //}
      else
      {
          this.setState({
              access,
              error: ""
          }, this._validateState);
      }
  };

  private _onDeselected = () => {
      this.setState({
          access: null,
          error: ""
      }, this._validateState);
  }

  private _onSelectPerson = (person: IPerson) => {
      this.setState({ person }, this._validateState);
  };


  private _validateState = () => {
      let valid = true;
      if (!this.state.access) {
          console.log("1");
          valid = false;
      } else if (!this.props.revoking &&
          ((!this.state.person && !this.props.person) || 
          !this._checkValidAssignmentToPerson())) {
          console.log("2");
          valid = false;
      } else if (this.props.revoking && 
          ((!this.state.person && !this.props.person) ||
          !this._checkValidRevokeFromPerson())) {
          console.log("3");
          valid = false;
      } else if (this.state.error !== "") {
          console.log("4");
          valid = false;
      } else if (!this.props.revoking && (!this.state.date || moment().isSameOrAfter(this.state.date))) {
          console.log("5");
          valid = false;
        }
      this.setState({ validState: valid });

  }

  private _checkValidAssignmentToPerson = () => {
      let valid = true;
      let assignments = this.state.access.assignments;
      for(let i = 0; i < assignments.length; i++)
      {
          if (assignments[i].personId === this.state.person.id)
          {
              valid = false;
              break;
          }
      }
      if (!valid)
      {
          this.setState({ error: "The user you have selected is already assigned this access." });
      }
      else
      {
          this.setState({ error: "" });
      }
      return valid;
  }

  private _checkValidRevokeFromPerson = () => {
      let valid = false;
      let assignments = this.state.access.assignments;
      for (let i = 0; i < assignments.length; i++) {
          if (assignments[i].personId === this.state.person.id) {
              valid = true;
              break;
          }
      }
      if (!valid)
      {
          this.setState({ error: "The user you have selected is not assigned this access." });
      }
      else {
          this.setState({ error: "" });
      }
      return valid;
  }

  private _changeDate = (newDate) => {
      this.setState({ date: newDate, error: "" }, this._validateState);
  }

  private _changeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      let m = moment(value, "MM/DD/YYYY", true);
      if (m.isValid()) {
          this._changeDate(m);
      }
      else {
          this.setState({ date: null, error: "Please enter a valid date" });
      }
  }
}
