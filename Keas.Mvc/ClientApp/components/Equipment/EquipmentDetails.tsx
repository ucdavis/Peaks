import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { AppContext, IEquipment } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import EquipmentAssignmentValues from "./EquipmentAssignmentValues";
import EquipmentEditValues from "./EquipmentEditValues";

interface IProps {
    modal: boolean;
    closeModal: () => void;
    openEditModal: (equipment: IEquipment) => void;
    openUpdateModal: (equipment: IEquipment) => void;
    selectedEquipment: IEquipment;
    updateSelectedEquipment: (equipment: IEquipment) => void;
}

export default class EquipmentDetails extends React.Component<IProps, {}> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;

    public componentDidMount() {
        if (!this.props.selectedEquipment) {
            return;
        }
        this._fetchDetails(this.props.selectedEquipment.id);
    }

    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps: IProps) {
        if (
            nextProps.selectedEquipment &&
            (!this.props.selectedEquipment ||
                nextProps.selectedEquipment.id !== this.props.selectedEquipment.id)
        ) {
            this._fetchDetails(nextProps.selectedEquipment.id);
        }
    }

    public render() {
        if (!this.props.selectedEquipment) {
            return null;
        }
        const equipment = this.props.selectedEquipment;
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="equipment-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>Details for {equipment.name}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>

                    <ModalBody>
                        <EquipmentEditValues
                            selectedEquipment={equipment}
                            disableEditing={true}
                            openEditModal={this.props.openEditModal}
                        />
                        <EquipmentAssignmentValues
                            selectedEquipment={equipment}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        <HistoryContainer controller="equipment" id={equipment.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }

    private _fetchDetails = async (id: number) => {
        const url = `/api/${this.context.team.slug}/equipment/details/${id}`;
        const equipment = await this.context.fetch(url);
        this.props.updateSelectedEquipment(equipment);
    };
}
