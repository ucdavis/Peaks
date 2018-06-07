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
    returnToSpaceDetails: (spaceId: number) => void;
    workstationId: number;
}

interface IState{
    error: string;
    loading: boolean;
    validState: boolean;
    workstation: IWorkstation;
}

export default class EditWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            error: "",
            loading: false,
            validState: false,
            workstation: null,
        };
    }

    public componentDidMount() {
        if(this.props.modal && this.props.workstationId !== null) {
            this._loadData(this.props.workstationId);
        }
    }

    public componentDidUpdate(prevProps) {
        if(!this.props.modal && prevProps.modal) {
            console.log("test");
        }
        else if(this.props.modal && this.props.workstationId !== prevProps.workstationId)
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
                <ModalHeader>Edit Workstation</ModalHeader>
                <ModalBody>
                    <WorkstationEditValues selectedWorkstation={this.state.workstation} 
                        disableEditing={false} 
                        changeProperty={this._changeProperty}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.props.returnToSpaceDetails(this.state.workstation.space.id)}>
                        Return To Space
                    </Button>
                    <Button color="secondary" onClick={this._editSelected}>
                        Save
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

    private _changeProperty = (property: string, value: string) => {
      this.setState({
        workstation: {
          ...this.state.workstation,
          [property]: value
        }
      }, this._validateState);
    };

    private _validateState = () => {
        let valid = true;
        if (!this.state.workstation) {
          valid = false;
        } else if (this.state.error !== "") {
          valid = false;
        }
        this.setState({ validState: valid });
      };

    private _editSelected = async () => {
        if (!this.state.validState) {
          return;
        }
    
        // this.state.workstation.attributes = this.state.workstation.attributes.filter(x => !!x.key);
        
        const updated: IWorkstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/update`, {
            body: JSON.stringify(this.state.workstation),
            method: "POST"
          });
    
        this.props.returnToSpaceDetails(this.state.workstation.space.id);
      };
    
    
}
