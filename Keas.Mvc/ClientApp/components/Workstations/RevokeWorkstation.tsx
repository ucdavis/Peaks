import * as PropTypes from 'prop-types';
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import WorkstationEditValues from "./WorkstationEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    revokeWorkstation: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
}

interface IState{
    loading: boolean;
}

export default class RevokeWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    public render() {
        if (!this.props.selectedWorkstation || !this.props.selectedWorkstation.assignment) 
        {
            return null;
        }
        if(this.state.loading) 
        {
            return <h2>Loading...</h2>;
        }
        return (
            <div>
            <Modal isOpen={this.props.modal} 
                toggle={this.props.closeModal} 
                size="lg">
                <ModalHeader>Details for {this.props.selectedWorkstation.name}</ModalHeader>
                <ModalBody>
                    <WorkstationEditValues selectedWorkstation={this.props.selectedWorkstation} disableEditing={true}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this._revokeWorkstation}>
                        Confirm Revoke
                    </Button>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>            </div>
        );
    }

    private _revokeWorkstation = async () => {
        if(!this.props.selectedWorkstation)
        {
            return null;
        }
        await this.props.revokeWorkstation(this.props.selectedWorkstation);
        this.props.closeModal();
    }
}
