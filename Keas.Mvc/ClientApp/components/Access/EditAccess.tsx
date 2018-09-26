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
import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import AccessEditValues from "./AccessEditValues";
import SearchAccess from "./SearchAccess";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
  onEdit: (access: IAccess) => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
}

interface IState {
  error: string;
  access: IAccess;
  validState: boolean;
}

export default class EditAccess extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      access: this.props.selectedAccess,
      error: "",
      validState: false
    };
  }

  // make sure we change the access we are updating if the parent changes selected access
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedAccess !== this.props.selectedAccess) {
      this.setState({ access: nextProps.selectedAccess });
    }
  }

  public render() {
    if(!this.state.access)
    {
      return null;
    }
    return (
      <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg" className="access-color">
        <div className="modal-header row justify-content-between">
          <h2>Edit Access</h2>
          <Button color="link" onClick={this._closeModal}>
          <i className="fas fa-times fa-lg"/>
          </Button>
        </div>
        <ModalBody>
          <div className="container-fluid">
            <form>
                  <AccessEditValues
                    selectedAccess={this.state.access}
                    changeProperty={this._changeProperty}
                    disableEditing={false}
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
            Update Access
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      access: {
        ...this.state.access,
        [property]: value
      }
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      access: null,
      error: "",
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected access even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState) {
      return;
    }


    await this.props.onEdit(this.state.access);

    this._closeModal();
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.access) {
      valid = false;
    } else if (this.state.error !== "") {
      valid = false;
    }
    this.setState({ validState: valid });
  };

}
