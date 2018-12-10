import * as PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, IKey } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import KeyEditValues from "./KeyEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    deleteKey: (key: IKey) => void;
    selectedKey: IKey;
}

interface IState {
    submitting: boolean;
}

export default class DeleteKey extends React.Component<IProps, IState> {
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
        if (!this.props.selectedKey)
        {
            return null;
        }
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="key-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Delete {this.props.selectedKey.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>

                    <ModalBody>
                        <KeyEditValues selectedKey={this.props.selectedKey} disableEditing={true} />
                        <HistoryContainer controller="keys" id={this.props.selectedKey.id}/>
                        
                    </ModalBody>
                    <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._deleteKey}
                        disabled={this.state.submitting}
                    >
                        Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin"/>}
                    </Button>{" "}

                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _deleteKey = async () => {
        if((!!this.props.selectedKey.serials && this.props.selectedKey.serials.some(x => x.keySerialAssignment !== null))&&
            !confirm("This key has serials that are currently assigned, are you sure you want to delete it?")){
            return;
          }
        this.setState({submitting: true});
        try{
            await this.props.deleteKey(this.props.selectedKey);
        }
        catch(err) {
            alert("There was an error deleting this key, please try again");
            this.setState({submitting: false});
            return;
        }
        this.setState({submitting: false});
        this.props.closeModal();
    }
}
