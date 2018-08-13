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
import { AppContext, IWorkstation } from "../../Types";
import WorkstationEditValues from "./WorkstationEditValues";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onEdit: (workstation: IWorkstation) => void;
  modal: boolean;
  closeModal: () => void;
  selectedWorkstation: IWorkstation;
  tags: string[];
}

interface IState {
  error: string;
  workstation: IWorkstation;
  validState: boolean;
}

export default class EditWorkstation extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      workstation: this.props.selectedWorkstation,
      error: "",
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedWorkstation !== this.props.selectedWorkstation) {
      this.setState({ workstation: nextProps.selectedWorkstation });
    }
  }

  public render() {
    if(!this.state.workstation)
    {
      return null;
    }
    return (
      <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
        <ModalHeader>Edit Workstation</ModalHeader>
        <ModalBody>
          <div className="container-fluid">
            <form>
                  <WorkstationEditValues
                    selectedWorkstation={this.state.workstation}
                    changeProperty={this._changeProperty}
                    disableEditing={false}
                    tags={this.props.tags}
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
            Update Workstation
          </Button>{" "}
          <Button color="secondary" onClick={this._closeModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      workstation: {
        ...this.state.workstation,
        [property]: value
      }
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      workstation: null,
      error: "",
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    await this.props.onEdit(this.state.workstation);

    this._closeModal();
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

}
