import * as PropTypes from 'prop-types';
import * as React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import * as moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { AppContext, IKey, IKeySerialAssignment, IPerson, IKeySerial } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import SearchKeySerial from "./SearchKeySerials";


interface IProps {
  person?: IPerson;
  selectedKey: IKey;
  selectedKeySerial: IKeySerial;
  onCreate: (person: IPerson, keySerial: IKeySerial, date: any) => void;
  isModalOpen: boolean;
  onOpenModal: () => void;
  closeModal: () => void;
}

interface IState {
  date: any;
  error: string;
  keySerial: IKeySerial;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class AssignKey extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };

  public context: AppContext;

  constructor(props: IProps) {
    super(props);

    const date = (!!this.props.selectedKeySerial && !!this.props.selectedKeySerial.assignment) 
      ? moment(this.props.selectedKeySerial.assignment.expiresAt)
      : moment().add(3, "y")

    const person = (!!this.props.selectedKeySerial && !!this.props.selectedKeySerial.assignment)
      ? this.props.selectedKeySerial.assignment.person
      : this.props.person;

    this.state = {
      date,
      error: "",
      keySerial: this.props.selectedKeySerial,
      person,
      submitting: false,
      validState: false
    };
  }

  public componentWillReceiveProps(nextProps: IProps) {
    // make sure we change the key we are updating if the parent changes selected key
    if (nextProps.selectedKeySerial !== this.props.selectedKeySerial) {
      this.setState({ keySerial: nextProps.selectedKeySerial });
    }

    if (nextProps.person !== this.state.person) {
      this.setState({ person: nextProps.person });
    }

    if(!!nextProps.selectedKeySerial && !!nextProps.selectedKeySerial.assignment)
    {
      this.setState({ 
        date: moment(nextProps.selectedKeySerial.assignment.expiresAt),
        person: nextProps.selectedKeySerial.assignment.person
      });
    }
  }

  public render() {
    return (
      <div>
        <Button color="link" onClick={this.props.onOpenModal}>
          <i className="fas fa-plus fa-sm" aria-hidden="true" /> Add Key Serial
        </Button>
        {this.renderModal()}
      </div>
    );
  }
  
  private renderModal() {
    const { isModalOpen, selectedKey } = this.props;
    const { person, keySerial } = this.state;

    return (
      <Modal isOpen={isModalOpen} toggle={this._closeModal} size="lg" className="keys-color">
        <div className="modal-header row justify-content-between">
          <h2>Assign Key Serial</h2>
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
                  person={person}
                  onSelect={this._onSelectPerson}
                />
              </div>
    
              <div className="form-group">
                <label>Pick an key serial to assign</label>
                <SearchKeySerial
                  selectedKey={selectedKey}
                  selectedKeySerial={keySerial}
                  onSelect={this._onSelected}
                  onDeselect={this._onDeselected}
                />
              </div>
              {(!!person || !!this.props.person) && (
                <div className="form-group">
                  <label>Set the expiration date</label>
                  <DatePicker
                    selected={this.state.date}
                    onChange={this._onChangeDate}
                    onChangeRaw={this._onChangeDateRaw}
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
            disabled={!this.state.validState || this.state.submitting}
          >
            Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin"/>}
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      date: moment().add(3, "y"),
      error: "",
      keySerial: null,
      person: null,
      submitting: false,
      validState: false
    });
    
    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({submitting: true});
    const person = this.props.person ? this.props.person : this.state.person;

    await this.props.onCreate(person, this.state.keySerial, this.state.date.format());

    this._closeModal();
  };

  private _onSelected = (keySerial: IKeySerial) => {
    // if this key is not already assigned


    // TODO: more validation of name
    if (keySerial.number.length > 64) {
      this.setState({
        error: "The key name you have chosen is too long",
        keySerial: null
      }, this._validateState);

      return;
    }

    // else if (this.props.assignedKeyList.findIndex(x => x == key.name) != -1)
    // {
    //    this.setState({ selectedKey: null, error: "The key you have chosen is already assigned to this user", validKey: false }, this._validateState);
    // }
    this.setState({ keySerial, error: "" }, this._validateState);
  };

  private _onDeselected = () => {
    this.setState({ keySerial: null, error: "" }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _onChangeDate = (newDate) => {
    this.setState({ date: newDate, error: "" }, this._validateState);
  };

  private _validateState = () => {
    let valid = true;
    if (!this.state.keySerial) {
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

  private _onChangeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const m = moment(value, "MM/DD/YYYY", true);
    if (m.isValid()) {
      this._onChangeDate(m);
    } else {
      this.setState({ date: null, error: "Please enter a valid date" });
    }
  };
}
