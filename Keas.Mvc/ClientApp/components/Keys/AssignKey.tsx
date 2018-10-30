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
import { AppContext, IKey, IKeyAssignment, IPerson } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import KeyEditValues from "./KeyEditValues";
import SearchKey from "./SearchKeys";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onCreate: (person: IPerson, key: IKey, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  closeModal: () => void;
  selectedKey: IKey;
  person?: IPerson;
}

interface IState {
  date: any;
  error: string;
  key: IKey;
  person: IPerson;
  validState: boolean;
}

export default class AssignKey extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      date: (!!this.props.selectedKey && !!this.props.selectedKey.assignment) 
        ? moment(this.props.selectedKey.assignment.expiresAt) : moment().add(3, "y"),      error: "",
      key: this.props.selectedKey,
      person: (!!this.props.selectedKey && !!this.props.selectedKey.assignment)
        ? this.props.selectedKey.assignment.person : this.props.person,
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedKey !== this.props.selectedKey) {
      this.setState({ key: nextProps.selectedKey });
    }

    if (nextProps.person !== this.state.person) {
      this.setState({ person: nextProps.person });
    }
    if(!!nextProps.selectedKey && !!nextProps.selectedKey.assignment)
    {
      this.setState({ 
        date: moment(nextProps.selectedKey.assignment.expiresAt),
        person: nextProps.selectedKey.assignment.person
      });
    }
  }

  public render() {
    return (
      <div>
        <Button color="link" onClick={this.props.onAddNew}>
          <i className="fas fa-plus fa-sm" aria-hidden="true" /> Add Key
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg" className="keys-color">
          <div className="modal-header row justify-content-between">
            <h2>Assign Key</h2>
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
                    person={this.state.person}
                    onSelect={this._onSelectPerson}
                  />
                </div>

                <div className="form-group">
                  <label>Pick an key to assign</label>
                  <SearchKey
                    selectedKey={this.state.key}
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                  />
                </div>
                {!this.state.key ||
                  (!this.state.key.teamId && ( // if we are creating a new key, edit properties
                    <KeyEditValues
                      selectedKey={this.state.key}
                      changeProperty={this._changeProperty}
                      disableEditing={false}
                      creating={true}
                    />
                  ))}
                {this.state.key &&
                  !!this.state.key.teamId && (
                    <KeyEditValues
                      selectedKey={this.state.key}
                      disableEditing={true}
                      creating={true}
                    />
                  )}

                {(!!this.state.person || !!this.props.person) && (
                  <div className="form-group">
                    <label>Set the expiration date</label>
                    <DatePicker
                      selected={this.state.date}
                      onChange={this._changeDate}
                      onChangeRaw={this._changeDateRaw}
                      className="form-control"
                    />
                  </div>
                )}
                {this.state.error}
              </form>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={this._assignSelected}
              disabled={!this.state.validState}
            >
              Go!
            </Button>{" "}
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      key: {
        ...this.state.key,
        [property]: value
      }
    });
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      date: moment().add(3, "y"),
      error: "",
      key: null,
      person: null,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    const person = this.props.person ? this.props.person : this.state.person;

    await this.props.onCreate(person, this.state.key, this.state.date.format());

    this._closeModal();
  };

  // once we have either selected or created the key we care about
  private _onSelected = (key: IKey) => {
    // if this key is not already assigned

    // TODO: more validation of name
    if (key.name.length > 64) {
      this.setState(
        {
          error: "The key name you have chosen is too long",
          key: null
        },
        this._validateState
      );
    } else {
      // else if (this.props.assignedKeyList.findIndex(x => x == key.name) != -1)
      // {
      //    this.setState({ selectedKey: null, error: "The key you have chosen is already assigned to this user", validKey: false }, this._validateState);
      // }
      this.setState({ key, error: "" }, this._validateState);
    }
  };

  private _onDeselected = () => {
    this.setState({ key: null, error: "" }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.key) {
      valid = false;
    } else if (this.state.error !== "") {
      valid = false;
    } else if (!this.state.date) {
      valid = false;
    } else if (moment().isSameOrAfter(this.state.date)) {
      valid = false;
    }
    this.setState({ validState: valid });
  };

  private _changeDate = newDate => {
    this.setState({ date: newDate, error: "" }, this._validateState);
  };

  private _changeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const m = moment(value, "MM/DD/YYYY", true);
    if (m.isValid()) {
      this._changeDate(m);
    } else {
      this.setState({ date: null, error: "Please enter a valid date" });
    }
  };
}
