import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, IEquipment } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import EquipmentEditValues from "./EquipmentEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    deleteEquipment: (equipment: IEquipment) => void;
    selectedEquipment: IEquipment;
}

interface IState {
    submitting: boolean;
}

export default class DeleteEquipment extends React.Component<IProps, IState> {
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
        if (this.props.selectedEquipment == null)
        {
            return null;
        }
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="equipment-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Delete {this.props.selectedEquipment.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>

                    <ModalBody>
                        <EquipmentEditValues selectedEquipment={this.props.selectedEquipment} disableEditing={true} />
                        <HistoryContainer controller="equipment" id={this.props.selectedEquipment.id}/>
                        
                    </ModalBody>
                    <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._deleteEquipment}
                        disabled={this.state.submitting}
                    >
                        Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin"/>}
                    </Button>{" "}

                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _deleteEquipment = async () => {
        if(this.props.selectedEquipment.assignment !== null &&
            !confirm("This equipment is currently assigned, are you sure you want to delete it?")){
            return false;
          }
        this.setState({submitting: true});
        try{
            await this.props.deleteEquipment(this.props.selectedEquipment);
        }
        catch(err) {
            alert("There was an error deleting this equipment, please try again");
            this.setState({submitting: false});
            return;
        }
        this.setState({submitting: false});
        this.props.closeModal();
    }
}
