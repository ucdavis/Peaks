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
import { AppContext, IPerson, IUser } from "../../Types";
import SearchUsers from "./SearchUsers";
import PersonEditValues from "./PersonEditValues";

interface IProps {
  onCreate: (person: IPerson) => void;
  modal: boolean;
  tags: string[];
  users: IUser[];
  onAddNew: () => void;
  closeModal: () => void;
}

interface IState {
  date: any;
  error: string;
  person: IPerson;
  validState: boolean;
}

export default class CreatePerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      date: moment().add(3, "y"),
      error: "",
      person: null,
      validState: false
    };
  }

  public render() {
    return (
      <div>
        <Button color="danger" onClick={this.props.onAddNew}>
          Add Person
        </Button>
        <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
          <ModalHeader>Create Person</ModalHeader>
          <ModalBody>
            <div className="container-fluid">

                <div className="form-group">
                  <SearchUsers
                    updateUser={this._onSelectUser}
                  />
                </div>

                <div className="form-group">
                  <PersonEditValues selectedPerson={this.state.person} changeProperty={this._changeProperty} disableEditing={false} tags={this.props.tags}/>
                </div>
                
                {this.state.error}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={this._assignSelected}
              disabled={!this.state.validState}
            >
              Go!
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
    });
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      error: "",
      person: null,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    await this.props.onCreate(this.state.person);

    this._closeModal();
  };

  // once we have selected a user
  private _onSelectUser = (user: IUser) => {
    // if this key is not already assigned

    // TODO: more validation of name
    if (!user) {
      this.setState(
        {
          error: "The user could not be found",
          person: null
        },
        this._validateState
      );
    } else if (this.props.users.findIndex(x => x.id === user.id) !== -1) {
      this.setState({
        error: "The user you have chosen is already active in this team",
        person: null,
      });
    } else {
      // else if (this.props.assignedKeyList.findIndex(x => x == key.name) != -1)
      // {
      //    this.setState({ selectedKey: null, error: "The key you have chosen is already assigned to this user", validKey: false }, this._validateState);
      // }
      var person: IPerson = {
        id: 0,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        user: user,
        userId: user.id,
        tags: "",
        teamId: 0,
      };
      this.setState({ person, error: "" }, this._validateState);
    }
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.person) {
      valid = false;
    } else if (this.state.error !== "") {
      valid = false;
    } else if (!this.state.date) {
      valid = false;
    } else if (moment().isSameOrAfter(this.state.date)) {
      valid = false;
    }
    this.setState({ validState: valid });
  };

}
