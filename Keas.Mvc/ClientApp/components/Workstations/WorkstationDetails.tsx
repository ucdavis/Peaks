import * as PropTypes from "prop-types";
import * as React from "react";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import WorkstationAssignmentValues from "./WorkstationAssignmentValues";
import WorkstationEditValues from "./WorkstationEditValues";

interface IProps {
    modal: boolean;
    closeModal: () => void;
    openEditModal: (workstation: IWorkstation) => void;
    openUpdateModal: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
    updateSelectedWorkstation: (workstation: IWorkstation) => void;
}

export default class WorkstationDetails extends React.Component<IProps, {}> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;

    public componentDidMount() {
        if (!this.props.selectedWorkstation) {
            return;
        }
        this._fetchDetails(this.props.selectedWorkstation.id);
    }

    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps: IProps) {
        if (
            nextProps.selectedWorkstation &&
            (!this.props.selectedWorkstation ||
                nextProps.selectedWorkstation.id !== this.props.selectedWorkstation.id)
        ) {
            this._fetchDetails(nextProps.selectedWorkstation.id);
        }
    }

    public render() {
        if (!this.props.selectedWorkstation) {
            return null;
        }
        const workstation = this.props.selectedWorkstation;
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="spaces-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>Details for {workstation.name}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>
                    <ModalBody>
                        <WorkstationEditValues
                            selectedWorkstation={workstation}
                            disableEditing={true}
                            disableSpaceEditing={true}
                            openEditModal={this.props.openEditModal}
                        />
                        <WorkstationAssignmentValues
                            selectedWorkstation={workstation}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        <HistoryContainer controller="workstations" id={workstation.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }

    private _fetchDetails = async (id: number) => {
        const url = `/api/${this.context.team.slug}/workstations/details/${id}`;
        let workstation: IWorkstation = null;
        try {
            workstation = await this.context.fetch(url);
        } catch (err) {
            toast.error("Error fetching workstation details. Please refresh to try again.");
            return;
        }
        this.props.updateSelectedWorkstation(workstation);
    };
}
