import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, IAccess, IAccessAssignment } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import AccessEditValues from "./AccessEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    deleteAccess: (access: IAccess) => void;
    selectedAccess: IAccess;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

interface IState {
    submitting: boolean;
}

export default class DeleteAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
      };
    public context: AppContext;
      constructor(props) {
        super(props);
        this.state = {
          submitting: false,
        };
      }
      
    public render() {
        if (this.props.selectedAccess == null)
        {
            return null;
        }
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="access-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Delete {this.props.selectedAccess.name}</h2>
                    <Button color="link" onClick={() => this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>

                    <ModalBody>
                        <AccessEditValues selectedAccess={this.props.selectedAccess} disableEditing={true} onRevoke={this.props.onRevoke}/>                        
                    </ModalBody>
                    <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._deleteAccess}
                        disabled={this.state.submitting}
                    >
                        Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin"/>}
                    </Button>{" "}

                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _deleteAccess = async () => {
        if(this.props.selectedAccess.assignments.length > 0 &&
            !confirm("This access is currently assigned, are you sure you want to delete it?")){
            return false;
          }

        await this.props.deleteAccess(this.props.selectedAccess);
    }
}
