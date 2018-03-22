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
import SearchAccess from "./SearchAccess";
import AssignPerson from "../Biographical/AssignPerson";
import AccessEditValues from "./AccessEditValues";

import 'react-datepicker/dist/react-datepicker.css';


interface IProps {
    onCreate: (person: IPerson, date: any) => void;
    onRevoke: (person: IPerson) => void;
    adding: boolean;
    modal: boolean;
    openModal: () => void;
    closeModal: () => void;
    selectAccess: (access: IAccess) => void;
    selectedAccess: IAccess;
    changeProperty: (property: string, value: string) => void;
}

interface IState {
  person: IPerson;
  date: any;
  error: string;
  validState: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      person: null,
      date: moment().add(3, 'y'),
      error: "",
      validState: false,
    };
  }

  //clear everything out on close
  private _closeModal = () => {
    this.setState({
        error: "",
        validState: false,
        person: null,
      });
      this.props.closeModal();
  };

  // assign the selected access even if we have to create it
  private _assignSelected = async () => {

    if (!this.state.validState) return;

    const person = this.context.person
        ? this.context.person
        : this.state.person;

    await this.props.onCreate(person, this.state.date.format());

    this._closeModal();
  };

  private _revokeSelected = async () => {

    const person = this.context.person
        ? this.context.person
        : this.state.person;

    await this.props.onRevoke(person);

    this._closeModal();
    };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
      console.log("selected in assign", access);
      //if this access is not already assigned

      //TODO: more validation of name
      if (access.name.length > 64)
      {
          this.props.selectAccess(null);
          this.setState({ error: "The access name you have chosen is too long" }, this._validateState);
      }
      //else if (this.props.assignedAccessList.findIndex(x => x == access.name) != -1)
      //{
      //    this.setState({ selectedAccess: null, error: "The access you have chosen is already assigned to this user", validAccess: false }, this._validateState);
      //}
      else
      {
          this.props.selectAccess(access);
          this.setState({ error: ""}, this._validateState);
      }
  };

  private _onDeselected = () => {
      this.props.selectAccess(null);
      this.setState({ error: ""}, this._validateState);
  }

  private _onSelectPerson = (person: IPerson) => {
      this.setState({ person }, this._validateState);
  };


  private _validateState = () => {
      let valid = true;
      if (!this.props.selectedAccess)
          valid = false;
      else if (this.state.error !== "")
          valid = false;
      else if (!this.state.date)
          valid = false;
      else if (moment().isSameOrAfter(this.state.date))
          valid = false;
      this.setState({ validState: valid });

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



  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.props.openModal}>
          Add Access
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
          <ModalHeader>Assign Access</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
                <form>
                    <div className="form-group">
                        <label htmlFor="assignto">Assign To</label>
                        <AssignPerson onSelect={this._onSelectPerson} />
                    </div>

                    <div className="form-group">
                        <label>Pick an access to assign</label>
                        <SearchAccess
                            selectedAccess={this.props.selectedAccess}
                            onSelect={this._onSelected}
                            onDeselect={this._onDeselected} />
                    </div>
                    {!this.props.selectedAccess || !this.props.selectedAccess.teamId && //if we are creating a new access, edit properties
                        <AccessEditValues selectedAccess={this.props.selectedAccess} changeProperty={this.props.changeProperty} disableEditing={false} />
                    }
                    {this.props.selectedAccess && !!this.props.selectedAccess.teamId &&
                         <AccessEditValues selectedAccess={this.props.selectedAccess} disableEditing={true} />
                    }

                    {(this.state.person !== null || this.context.person !== null) && 
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
            {this.props.adding &&
                <Button color="primary" onClick={this._assignSelected} disabled={!this.state.validState}>
                    Go!
                </Button>}
            {!this.props.adding &&
                <Button color="primary" onClick={this._revokeSelected} disabled={!this.state.validState}>
                    Go!
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
}
