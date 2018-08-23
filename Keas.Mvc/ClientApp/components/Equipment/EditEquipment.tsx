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
import { AppContext, IEquipment, IEquipmentAttribute, ISpace } from "../../Types";
import EquipmentEditValues from "./EquipmentEditValues";
import SearchEquipment from "./SearchEquipment";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onEdit: (equipment: IEquipment) => void;
  modal: boolean;
  closeModal: () => void;
  commonAttributeKeys: string[];
  selectedEquipment: IEquipment;
  space: ISpace;
  tags: string[];
}

interface IState {
  error: string;
  equipment: IEquipment;
  validState: boolean;
}

export default class EditEquipment extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      equipment: this.props.selectedEquipment,
      error: "",
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedEquipment !== this.props.selectedEquipment) {
      this.setState({ equipment: nextProps.selectedEquipment });
    }
  }

  public render() {
    if(!this.state.equipment)
    {
      return null;
    }
    return (
      <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg" className="equipment-color">
        <div className="modal-header row justify-content-between">
          <h2>Edit Equipment</h2>
          <Button color="link" onClick={this._closeModal}>
          <i className="fas fa-times fa-lg"/>
          </Button>
        </div>
        <ModalBody>
          <div className="container-fluid">
            <form>
                  <EquipmentEditValues
                    selectedEquipment={this.state.equipment}
                    changeProperty={this._changeProperty}
                    disableEditing={false}
                    updateAttributes={this._updateAttributes}
                    commonAttributeKeys={this.props.commonAttributeKeys}
                    tags={this.props.tags}
                    space={this.props.space}
                  />
            </form>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={this._editSelected}
            disabled={!this.state.validState}
          >
            Update Equipment
          </Button>{" "}

        </ModalFooter>
      </Modal>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        [property]: value
      }
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      equipment: null,
      error: "",
      validState: false
    });
    this.props.closeModal();
  };

  private _updateAttributes = (attributes: IEquipmentAttribute[]) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        attributes
      }
    }, this._validateState);
  }

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    this.state.equipment.attributes = this.state.equipment.attributes.filter(x => !!x.key);

    await this.props.onEdit(this.state.equipment);

    this._closeModal();
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.equipment) {
      valid = false;
    } else if (this.state.error !== "") {
      valid = false;
    }
    this.setState({ validState: valid });
  };

}
