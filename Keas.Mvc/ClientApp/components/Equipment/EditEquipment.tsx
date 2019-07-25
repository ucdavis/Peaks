import * as PropTypes from "prop-types";
import * as React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IEquipment, IEquipmentAttribute, ISpace } from "../../Types";
import EquipmentAssignmentValues from "./EquipmentAssignmentValues";
import EquipmentEditValues from "./EquipmentEditValues";

interface IProps {
    onEdit: (equipment: IEquipment) => void;
    modal: boolean;
    closeModal: () => void;
    openUpdateModal: (equipment: IEquipment) => void;
    commonAttributeKeys: string[];
    equipmentTypes: string[];
    selectedEquipment: IEquipment;
    space: ISpace;
    tags: string[];
}

interface IState {
    error: string;
    equipment: IEquipment;
    submitting: boolean;
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
            equipment: this.props.selectedEquipment
                ? {
                      ...this.props.selectedEquipment,
                      attributes: { ...this.props.selectedEquipment.attributes }
                  }
                : null,
            error: "",
            submitting: false,
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
        if (!this.state.equipment) {
            return null;
        }
        return (
            <Modal
                isOpen={this.props.modal}
                toggle={this._confirmClose}
                size="lg"
                className="equipment-color" 
            >
                <div className="modal-header row justify-content-between">
                    <h2>Edit Equipment</h2>
                    <Button color="link" onClick={this._closeModal}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    <div className="container-fluid">
                        <EquipmentEditValues
                            selectedEquipment={this.state.equipment}
                            changeProperty={this._changeProperty}
                            disableEditing={false}
                            updateAttributes={this._updateAttributes}
                            commonAttributeKeys={this.props.commonAttributeKeys}
                            equipmentTypes={this.props.equipmentTypes}
                            tags={this.props.tags}
                            space={this.props.space}
                        />
                        <EquipmentAssignmentValues
                            selectedEquipment={this.props.selectedEquipment}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        {this.state.error}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._editSelected}
                        disabled={!this.state.validState || this.state.submitting}
                    >
                        Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                    </Button>{" "}
                </ModalFooter>
            </Modal>
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                equipment: {
                    ...this.state.equipment,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _confirmClose = () => {
        if (!confirm("Please confirm you want to close!")){
            return;
        }

        this._closeModal();
    }

    private _closeModal = () => {
        this.setState({
            equipment: null,
            error: "",
            submitting: false,
            validState: false
        });
        this.props.closeModal();
    };

    private _updateAttributes = (attributes: IEquipmentAttribute[]) => {
        this.setState(
            {
                equipment: {
                    ...this.state.equipment,
                    attributes
                }
            },
            this._validateState
        );
    };

    // assign the selected key even if we have to create it
    private _editSelected = async () => {
        if (!this.state.validState || this.state.submitting) {
            return;
        }
        this.setState({ submitting: true });
        this.state.equipment.attributes = this.state.equipment.attributes.filter(x => !!x.key);

        await this.props.onEdit(this.state.equipment);

        this._closeModal();
    };

    private _validateState = () => {
        let valid = true;
        let error = "";
        if (!this.state.equipment) {
            valid = false;
        } else if (!this.state.equipment.name) {
            valid = false;
            error = "You must give this equipment a name.";
        } else if (this.state.equipment.name.length > 64) {
            valid = false;
            error = "The name you have chosen is too long";
        }
        this.setState({ validState: valid, error });
    };
}
