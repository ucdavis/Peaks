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
import { AppContext, IEquipment, IEquipmentAssignment, IEquipmentAttribute, IPerson } from "../../Types";
import SearchEquipment from "./SearchEquipment";
import AssignPerson from "../Biographical/AssignPerson";

import 'react-datepicker/dist/react-datepicker.css';


interface IProps {
    onCreate: (person: IPerson) => void;
    modal: boolean;
    modalLoading: boolean;
    openModal: () => void;
    closeModal: () => void;
    selectEquipment: (equipment: IEquipment) => void;
    selectedEquipment: IEquipment;
    unassignedEquipment: IEquipment[];
}

interface IState {
  person: IPerson;
  date: any;
  error: string;
  validState: boolean;
}

export default class AssignEquipment extends React.Component<IProps, IState> {
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
      });
      this.props.closeModal();
  };

  // assign the selected equipment even if we have to create it
  private _assignSelected = async () => {

    if (!this.state.validState) return;

    const person = this.context.person
        ? this.context.person
        : this.state.person;

    await this.props.onCreate(person);

    this._closeModal();
  };

  // once we have either selected or created the equipment we care about
  private _onSelected = (equipment: IEquipment) => {
      console.log("selected in assign", equipment);
      //if this equipment is not already assigned

      //TODO: more validation of name
      if (equipment.name.length > 64)
      {
          this.props.selectEquipment(null);
          this.setState({ error: "The equipment name you have chosen is too long" }, this._validateState);
      }
      //else if (this.props.assignedEquipmentList.findIndex(x => x == equipment.name) != -1)
      //{
      //    this.setState({ selectedEquipment: null, error: "The equipment you have chosen is already assigned to this user", validEquipment: false }, this._validateState);
      //}
      else
      {
          this.props.selectEquipment(equipment);
          this.setState({ error: ""}, this._validateState);
      }
  };

  private _onDeselected = () => {
      this.props.selectEquipment(null);
      this.setState({ error: ""}, this._validateState);
  }

  private _onSelectPerson = (person: IPerson) => {
      this.setState({ person }, this._validateState);
  };


  private _validateState = () => {
      let valid = true;
      if (this.props.selectedEquipment == null)
          valid = false;
      else if (this.state.error != "")
          valid = false;
      else if (this.state.date == null)
          valid = false;
      else if (moment().isSameOrAfter(this.state.date))
          valid = false;
      this.setState({ validState: valid });

  }

  private _changeDate = (newDate) => {
      this.setState({ date: newDate }, this._validateState);
  }

  public render() {
    // TODO: move datepicker into new component, try to make it look nice
    // TODO: only show step 2 if state.selectedEquipment is truthy
    // TODO: use expiration date as part of assignment
    return (
      <div>
        <Button color="danger" onClick={this.props.openModal}>
          Add Equipment
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
          <ModalHeader>Assign Equipment</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
                <form>
                    <div className="form-group">
                        <label htmlFor="assignto">Assign To</label>
                        <AssignPerson onSelect={this._onSelectPerson} />
                    </div>

                    <div className="form-group">
                        <label>Pick an equipment to assign</label>
                        <SearchEquipment
                            equipmentList={this.props.unassignedEquipment}
                            selectedEquipment={this.props.selectedEquipment}
                            loading={this.props.modalLoading}
                            onSelect={this._onSelected}
                            onDeselect={this._onDeselected} />
                        {this.state.error}
                    </div>


                    {this.props.selectedEquipment != null &&
                        <div className="form-group">
                            <label>Set the expiration date</label>
                            <DatePicker
                                selected={this.state.date}
                                onChange={this._changeDate}
                            />
                        </div>}
                </form>
            </div>
          </ModalBody>
          <ModalFooter>
              <Button color="primary" onClick={this._assignSelected} disabled={!this.state.validState}>
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
}
