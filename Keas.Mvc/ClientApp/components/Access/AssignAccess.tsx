import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";

import * as moment from "moment";
import DatePicker from "react-datepicker";
import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import AccessEditValues from "./AccessEditValues";
import SearchAccess from "./SearchAccess";

import 'react-datepicker/dist/react-datepicker.css';

interface IProps {
    closeModal: () => void;
    modal: boolean;
    onCreate: (access: IAccess, date: any, person: IPerson) => void;
    onAddNew: () => void;
    person?: IPerson;
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
              <Button color="link" onClick={this.props.onAddNew}>
                  <i className="fas fa-plus fa-sm" aria-hidden="true" />  Add Access
              </Button>
              <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg" className="access-color">
                <div className="modal-header row justify-content-between">
                  <h2>Assign Access</h2>
                  <Button color="link" onClick={this._closeModal}>
                  <i className="fas fa-times fa-lg"/>
                  </Button>
                </div>
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
                                      allowNew={true}
                                      selectedAccess={this.state.access}
                                      onSelect={this._onSelected}
                                      onDeselect={this._onDeselected} />
                              </div>
                              {!this.props.selectedAccess || !this.props.selectedAccess.teamId && // if we are creating a new access, edit properties
                                  <AccessEditValues
                                  selectedAccess={this.props.selectedAccess}
                                  changeProperty={this._changeProperty}
                                  disableEditing={false}
                                  creating={true}/>
                              }
                              {!!this.props.selectedAccess && !!this.props.selectedAccess.teamId &&
                                  <AccessEditValues
                                  selectedAccess={this.props.selectedAccess}
                                  disableEditing={true}
                                  creating={true}/>
                              }

                              {(!!this.state.person || !!this.props.person) &&
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
                          <Button color="primary" onClick={this._assignSelected} disabled={!this.state.validState}>
                              Go!
                         </Button>
                      {" "}
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

  // clear everything out on close
  private _closeModal = () => {
      this.setState({
        access:null,
        error: "",
        person: null,
        validState: false,
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


  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
      // if this access is not already assigned

      // TODO: more validation of name
      if (access.name.length > 64)
      {
          this.setState({
              access: null,
              error: "The access name you have chosen is too long"
          },
              this._validateState);
      }
      // else if (this.props.assignedAccessList.findIndex(x => x == access.name) != -1)
      // {
      //    this.setState({ selectedAccess: null, error: "The access you have chosen is already assigned to this user", validAccess: false }, this._validateState);
      // }
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
          valid = false;
      } else if ((!!this.state.person || !!this.props.person) &&
          !this._checkValidAssignmentToPerson()) {
          valid = false;
      } else if (this.state.error !== "") {
          valid = false;
      } else if ((!!this.state.person || !!this.props.person) &&
          (!this.state.date || moment().isSameOrAfter(this.state.date))) {
          valid = false;
        }
      this.setState({ validState: valid });

  }

  private _checkValidAssignmentToPerson = () => {
      let valid = true;
      const person = this.props.person ? this.props.person : this.state.person;
      const assignments = this.state.access.assignments;
      for (const a of assignments)
      {
          if (a.personId === person.id)
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

  private _changeDate = (newDate) => {
      this.setState({ date: newDate, error: "" }, this._validateState);
  }

  private _changeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const m = moment(value, "MM/DD/YYYY", true);
      if (m.isValid()) {
          this._changeDate(m);
      }
      else {
          this.setState({ date: null, error: "Please enter a valid date", validState: false });
      }
  }
}
