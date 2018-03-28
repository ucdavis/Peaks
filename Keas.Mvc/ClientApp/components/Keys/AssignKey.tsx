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
import AssignPerson from "../Biographical/AssignPerson";
import KeyEditValues from "./KeyEditValues";
import SearchKey from "./SearchKeys";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onCreate: (person: IPerson, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  closeModal: () => void;
  selectKey: (key: IKey) => void;
  selectedKey: IKey;
  changeProperty: (property: string, value: string) => void;
  person?: IPerson;
}

interface IState {
  person: IPerson;
  date: any;
  error: string;
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
      date: moment().add(3, "y"),
      error: "",
      person: null,
      validState: false
    };
  }

  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.props.onAddNew}>
          Add Key
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
          <ModalHeader>Assign Key</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <form>
                <div className="form-group">
                  <label htmlFor="assignto">Assign To</label>
                  <AssignPerson onSelect={this._onSelectPerson} />
                </div>

                <div className="form-group">
                  <label>Pick an key to assign</label>
                  <SearchKey
                    selectedKey={this.props.selectedKey}
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                  />
                </div>
                {!this.props.selectedKey ||
                  (!this.props.selectedKey.teamId && ( // if we are creating a new key, edit properties
                    <KeyEditValues
                      selectedKey={this.props.selectedKey}
                      changeProperty={this.props.changeProperty}
                      disableEditing={false}
                    />
                  ))}
                {this.props.selectedKey &&
                  !!this.props.selectedKey.teamId && (
                    <KeyEditValues
                      selectedKey={this.props.selectedKey}
                      disableEditing={true}
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
            <Button color="secondary" onClick={this._closeModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      error: "",
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

    await this.props.onCreate(person, this.state.date.format());

    this._closeModal();
  };

  // once we have either selected or created the key we care about
  private _onSelected = (key: IKey) => {
    console.log("selected in assign", key);
    // if this key is not already assigned

    // TODO: more validation of name
    if (key.name.length > 64) {
      this.props.selectKey(null);
      this.setState(
        { error: "The key name you have chosen is too long" },
        this._validateState
      );
    } else {
      // else if (this.props.assignedKeyList.findIndex(x => x == key.name) != -1)
      // {
      //    this.setState({ selectedKey: null, error: "The key you have chosen is already assigned to this user", validKey: false }, this._validateState);
      // }
      this.props.selectKey(key);
      this.setState({ error: "" }, this._validateState);
    }
  };

  private _onDeselected = () => {
    this.props.selectKey(null);
    this.setState({ error: "" }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _validateState = () => {
    let valid = true;
    if (!this.props.selectedKey) {
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
