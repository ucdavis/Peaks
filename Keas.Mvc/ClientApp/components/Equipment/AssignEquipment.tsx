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
import { AppContext, IEquipment, IEquipmentAssignment, IEquipmentAttribute, IPerson, IRoom } from "../../Types";
import AssignPerson from "../Biographical/AssignPerson";
import EquipmentEditValues from "./EquipmentEditValues";
import SearchEquipment from "./SearchEquipment";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onCreate: (person: IPerson, equipment: IEquipment, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  closeModal: () => void;
  selectedEquipment: IEquipment;
  person?: IPerson;
}

interface IState {
  commonAttributeKeys: string[];
  date: any;
  equipment: IEquipment;
  error: string;
  person: IPerson;
  validState: boolean;
}

export default class AssignEquipment extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      commonAttributeKeys: [],
      date: moment().add(3, "y"),
      equipment: this.props.selectedEquipment,
      error: "",
      person: null,
      validState: false
    };
  }

  // pull the common attributes here so we only do it once
  public async componentDidMount() {
    const equipmentFetchUrl = `/equipment/commonAttributeKeys/${this.context.team.id}`;

    const commonAttributeKeys = await this.context.fetch(equipmentFetchUrl);
    this.setState({ commonAttributeKeys});
  }

  // make sure we change the equipment we are updating if the parent changes selected equipment
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedEquipment !== this.props.selectedEquipment) {
      this.setState({ equipment: nextProps.selectedEquipment });
    }

    if (nextProps.person !== this.props.person) {
      this.setState({ person: nextProps.person });
    }
  }

  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.props.onAddNew}>
          Add Equipment
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
          <ModalHeader>Assign Equipment</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <form>
                <div className="form-group">
                  <label htmlFor="assignto">Assign To</label>
                  <AssignPerson
                    person={this.props.person || this.state.person}
                    onSelect={this._onSelectPerson}
                  />
                </div>

                <div className="form-group">
                  <label>Pick an equipment to assign</label>
                  <SearchEquipment
                    selectedEquipment={this.state.equipment}
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                  />
                </div>
                {!this.state.equipment ||
                  (!this.state.equipment.teamId && ( // if we are creating a new equipment, edit properties
                    <EquipmentEditValues
                      selectedEquipment={this.state.equipment}
                      commonAttributeKeys={this.state.commonAttributeKeys}
                      changeProperty={this._changeProperty}
                      disableEditing={false}
                      updateAttributes={this._updateAttributes}
                    />
                  ))}
                {this.state.equipment &&
                  !!this.state.equipment.teamId && (
                    <EquipmentEditValues
                      selectedEquipment={this.state.equipment}
                      commonAttributeKeys={this.state.commonAttributeKeys}
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

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        [property]: value
      }
    });
  };

  private _updateAttributes = (attributes: IEquipmentAttribute[]) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        attributes
      }
    });
  }

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      equipment: null,
      error: "",
      person: null,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected equipment even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    console.log("in assign");
    console.log(this.state.equipment);

    const person = this.props.person ? this.props.person : this.state.person;

    const equipment = this.state.equipment;
    equipment.attributes = equipment.attributes.filter(x => !!x.key && !!x.value);

    console.log(equipment);

    await this.props.onCreate(person, equipment, this.state.date.format());

    this._closeModal();
  };

  // once we have either selected or created the equipment we care about
  private _onSelected = (equipment: IEquipment) => {
    // if this equipment is not already assigned

    // TODO: more validation of name
    if (equipment.name.length > 64) {
      this.setState(
        {
          equipment: null,
          error: "The equipment name you have chosen is too long",
        },
        this._validateState
      );
    } else {
      // else if (this.props.assignedEquipmentList.findIndex(x => x == equipment.name) != -1)
      // {
      //    this.setState({ selectedEquipment: null, error: "The equipment you have chosen is already assigned to this user", validEquipment: false }, this._validateState);
      // }
      this.setState({ equipment, error: "" }, this._validateState);
    }
  };

  private _onDeselected = () => {
    this.setState({ equipment: null, error: "" }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _onSelectRoom = (room: IRoom) => {
      this.setState({
          equipment: {
              ...this.state.equipment,
              room
          }
      });
  };

  private _validateState = () => {
    let valid = true;
    if (!this.state.equipment) {
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
