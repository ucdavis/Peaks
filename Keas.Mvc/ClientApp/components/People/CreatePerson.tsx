import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";

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
  moreInfoString: string; // for errors and for explaining results, e.g. if person is new or inactive
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
      moreInfoString: "",
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
                    updatePerson={this._onSelectPerson}
                  />
                </div>

                <div className="form-group">
                  <PersonEditValues selectedPerson={this.state.person} changeProperty={this._changeProperty} disableEditing={false} tags={this.props.tags}/>
                </div>
                
                {this.state.moreInfoString}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={this._createSelected}
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
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      moreInfoString: "",
      person: null,
      validState: false
    });
    this.props.closeModal();
  };

  private _createSelected = async () => {
    if (!this.state.validState) {
      return;
    }

    try {
      await this.props.onCreate(this.state.person);
      this._closeModal();
    }
    catch(err) {
      this.setState({
        moreInfoString: "There was an error adding this person to your team: " + err.message,
        person: null,
        validState: false,
      });
    };
  };

  // once we have selected a user from SearchUser
  private _onSelectPerson = (person: IPerson) => {
    if (person === null) {
      // if there was a 404, person will be null
      this.setState(
        {
          moreInfoString: "The user could not be found",
          person: null
        },
        this._validateState
      );
    } else if(person === undefined) {
      // if there was an error that is not a 404, person will be undef
      this.setState({
          moreInfoString: "There was an error processing your search",
          person: null
        }, this._validateState
      );
    } else if (this.props.users.findIndex(x => x.id === person.userId) !== -1 || (person.active && person.teamId !== 0)) {
      this.setState({
        moreInfoString: "The user you have chosen is already active in this team",
        person: null,
      }, this._validateState);
    } else if (person.active && person.teamId === 0) {
      this.setState({
        moreInfoString: "You are creating a new person",
        person,
      },
      this._validateState);
    } else {
      this.setState({ person, moreInfoString: "This person was set to inactive. Continuing will set them to active" }, this._validateState);
    }
  };


  private _validateState = () => {
    let valid = true;
    if (!this.state.person) {
      valid = false;
    } else if (!this.state.person.firstName || !this.state.person.lastName || !this.state.person.email) {
      valid = false;
    } 
    this.setState({ validState: valid });
  };

}
