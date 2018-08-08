import PropTypes from "prop-types";
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
    updateCount: (spaceId: number) => void;
    workstationId: number;
}

interface IState{
    loading: boolean;
    workstation: IWorkstation;
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
            workstation: null,
        };
    }

    public componentDidMount() {
        if(this.props.modal && this.props.workstationId !== null) {
            this._loadData(this.props.workstationId);
        }
    }

    public componentDidUpdate(prevProps) {
        if(this.props.modal && this.props.workstationId !== prevProps.workstationId)
        {
            this._loadData(this.props.workstationId);
        }
    }

    public render() {
        if (this.props.workstationId === null) 
        {
            return null;
        }
        if(this.state.loading) 
        {
            return <h2>Loading...</h2>;
        }
        return (
            <div>
                {!!this.state.workstation && this._renderFound()}
                {!this.state.workstation && this._renderNotFound()}
            </div>
        );
    }

    private _renderNotFound = () => {
        return (
            <Modal isOpen={this.props.modal}
                toggle={this.props.closeModal} 
                size="lg">
                <ModalHeader>Workstation not found, please try again</ModalHeader>
                <ModalFooter>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private _renderFound = () => {
        return (
            <Modal isOpen={this.props.modal} 
                toggle={this.props.closeModal} 
                size="lg">
                <ModalHeader>Details for {this.state.workstation.name}</ModalHeader>
                <ModalBody>
                    <WorkstationEditValues selectedWorkstation={this.state.workstation} disableEditing={true}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this._revokeWorkstation}>
                        Confirm Revoke
                    </Button>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private _loadData = async (id: number) => {
        this.setState({ loading: true });
        const workstation =
            await this.context.fetch(`/api/${this.context.team.name}/workstations/details?id=${id}`);
        this.setState({ workstation, loading: false });
    }

    private _revokeWorkstation = async () => {
        if(!this.state.workstation)
        {
            return null;
        }
        const removed: IWorkstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/revoke`, {
            body: JSON.stringify(this.state.workstation),
            method: "POST"
          });
        this.props.updateCount(this.state.workstation.space.id);
        this.props.returnToSpaceDetails(this.state.workstation.space.id);
    }
}
