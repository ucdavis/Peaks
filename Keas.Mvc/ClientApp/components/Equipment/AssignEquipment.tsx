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
import { AppContext, IEquipment, IEquipmentAssignment, IPerson } from "../../Types";
import SearchEquipment from "./SearchEquipment";

import 'react-datepicker/dist/react-datepicker.css';


interface IProps {
    onAssign: (equipment: IEquipment, date: string) => Promise<IEquipmentAssignment>;
    assignedEquipmentList: string[];
}

interface IState {
  equipmentList: IEquipment[];
  selectedEquipment: IEquipment;
  date: any;
  modal: boolean;
  loading: boolean;
  error: string;
  validState: boolean;
  validEquipment: boolean;
}

export default class AssignEquipment extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object
    };
    public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      equipmentList: [],
      selectedEquipment: null,
      date: moment().add(3, 'y'),
      modal: false,
      loading: true,
      error: "",
      validState: false,
      validEquipment: false,
    };
  }

  //clear everything out on close
  public closeModal = () => {
    this.setState({
        modal: false,
        selectedEquipment: null,
        error: "",
        validEquipment: false,
        validState: false,
    });
  };

  public openModal = async () => {
      this.setState({ modal: true, loading: true });
      const equipmentList: IEquipment[] = await this.context.fetch(
          `/equipment/listteamequipment?teamId=${this.context.person.teamId}`
      );
      this.setState({ equipmentList: equipmentList, loading: false });
  };

  // assign the selected equipment even if we have to create it
  private _assignSelected = async () => {

    if (!this.state.validState) return;
    console.log("assign selected", this.state.selectedEquipment);

    const equipmentAssignment = await this.props.onAssign(this.state.selectedEquipment, this.state.date.format("YYYY MM DD").toString());

    this.setState({
      equipmentList: [...this.state.equipmentList, equipmentAssignment.equipment],
    });
    this.closeModal();
  };

  // once we have either selected or created the equipment we care about
  private _onSelected = (equipment: IEquipment) => {
      console.log("selected in assign", equipment);
      //if this equipment is not already assigned
      //TODO: more validation of name
      if (equipment.name.length > 64)
      {
          this.setState({ selectedEquipment: null, error: "The equipment name you have chosen is too long", validEquipment: false }, this._validateState);
      }
      else if (this.props.assignedEquipmentList.findIndex(x => x == equipment.name) != -1)
      {
          this.setState({ selectedEquipment: null, error: "The equipment you have chosen is already assigned to this user", validEquipment: false }, this._validateState);
      }
      else
      {
          this.setState({ selectedEquipment: equipment, error: "", validEquipment: true }, this._validateState);
      }
  };

  private _onDeselected = () => {
      this.setState({ selectedEquipment: null, error: "", validEquipment: false }, this._validateState);
  }


  private _validateState = () => {
      let valid = true;
      if (this.state.selectedEquipment == null)
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
        <Button color="danger" onClick={this.openModal}>
          Add Equipment
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.closeModal} size="lg">
          <ModalHeader>Assign Equipment</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm">
                    <label>Pick an equipment to assign</label>
                    <SearchEquipment
                        equipmentList={this.state.equipmentList}
                        loading={this.state.loading}
                        onSelect={this._onSelected}
                        onDeselect={this._onDeselected} />
                    {this.state.error}
                </div>
              </div>
              <div>
                <div className="row">
                    {this.state.validEquipment &&
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
