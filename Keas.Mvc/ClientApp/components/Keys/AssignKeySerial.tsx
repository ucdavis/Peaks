import * as moment from "moment";
import * as PropTypes from 'prop-types';
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { AppContext, IKey, IKeySerial, IPerson } from "../../Types";
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
  openEditModal: (keySerial: IKeySerial) => void;
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

    const assignment = props.selectedKeySerial && props.selectedKeySerial.keySerialAssignment;

    const date = (!!assignment) 
      ? moment(assignment.expiresAt)
      : moment().add(3, "y").startOf("day")

    const person = (!!assignment)
      ? assignment.person
      : props.person;

    this.state = {
      date,
      error: "",
      keySerial: props.selectedKeySerial,
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

    const assignment = nextProps.selectedKeySerial && nextProps.selectedKeySerial.keySerialAssignment;
    if (!!assignment) {
      this.setState({
        date: moment(assignment.expiresAt),
        person: assignment.person
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
                  disabled={!!this.props.person || 
                    (!!this.props.selectedKeySerial && !!this.props.selectedKeySerial.keySerialAssignment)} 
                    // disable if we are on person page or updating
                  person={person}
                  onSelect={this._onSelectPerson}
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
                    showMonthDropdown={true}
                    showYearDropdown={true}
                    dropdownMode="select"
                  />
                </div>
              )}
              {!!this.state.keySerial && !!this.state.keySerial.id && 
              <div>
                <Button color="link" onClick={() => this.props.openEditModal(this.props.selectedKeySerial)}>
                    <i className="fas fa-edit fa-xs" /> Edit Serial
                </Button>
              </div>}
              <div className="form-group">
                <label>Pick a key serial to assign</label>
                <SearchKeySerial
                  allowNew={!this.props.person} // don't allow new on person page
                  selectedKey={selectedKey}
                  selectedKeySerial={keySerial}
                  onSelect={this._onSelected}
                  onDeselect={this._onDeselected}
                />
              </div>
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
      date: moment().add(3, "y").startOf("day"),
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
    this.setState({ keySerial, error: "" }, this._validateState);
  };

  private _onDeselected = () => {
    this.setState({ keySerial: null, error: "" }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _onChangeDate = (newDate) => {
    this.setState({ date: newDate.startOf("day"), error: "" }, this._validateState);
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
