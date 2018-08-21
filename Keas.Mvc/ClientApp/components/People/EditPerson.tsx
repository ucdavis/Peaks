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
import { AppContext, IPerson } from "../../Types";

import "react-datepicker/dist/react-datepicker.css";
import PersonEditValues from "./PersonEditValues";

interface IProps {
  onEdit: (person: IPerson) => void;
  selectedPerson: IPerson;
  tags: string[];
}

interface IState {
  error: string;
  modal: boolean;
  person: IPerson;
  validState: boolean;
}

export default class EditPerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      person: this.props.selectedPerson,
      modal: false,
      error: "",
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPerson.id !== this.props.selectedPerson.id) {
      this.setState({ person: nextProps.selectedPerson });
    }
  }

  public render() {
    if(!this.state.person)
    {
      return null;
    }
    return (
      <div>
        <Button color="danger" onClick={this._toggleModal}>
          Edit Person
        </Button>
        <Modal isOpen={this.state.modal} toggle={this._closeModal} size="lg">
        <ModalHeader>Edit Person</ModalHeader>
        <ModalBody>
          <div className="container-fluid">
            <form>
                  <PersonEditValues
                    selectedPerson={this.state.person}
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
            Update Person
          </Button>{" "}
          <Button color="secondary" onClick={this._closeModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      </div>
      
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      person: {
        ...this.state.person,
        [property]: value
      }
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      modal: false,
      error: "",
      validState: false
    });
  };

  private _toggleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    await this.props.onEdit(this.state.person);

    this._closeModal();
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.person) {
      valid = false;
    } else if (this.state.error !== "") {
      valid = false;
    }
    this.setState({ validState: valid });
  };

}
