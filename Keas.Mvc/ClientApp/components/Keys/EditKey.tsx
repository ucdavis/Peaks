import * as PropTypes from 'prop-types';
import * as React from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { AppContext, IKey } from "../../Types";
import KeyEditValues from "./KeyEditValues";

interface IProps {
  onEdit: (key: IKey) => void;
  modal: boolean;
  closeModal: () => void;
  selectedKey: IKey;
}

interface IState {
  error: string;
  key: IKey;
  submitting: boolean;
  validState: boolean;
}

export default class EditKey extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      key: this.props.selectedKey,
      submitting: false,
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedKey !== this.props.selectedKey) {
      this.setState({ key: nextProps.selectedKey });
    }
  }

  public render() {
    if(!this.state.key)
    {
      return null;
    }
    return (
      <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg" className="keys-color">
        <div className="modal-header row justify-content-between">
          <h2>Edit Key</h2>
          <Button color="link" onClick={this._closeModal}>
            <i className="fas fa-times fa-lg"/>
          </Button>
        </div>
        <ModalBody>
          <div className="container-fluid">
            <form>
                  <KeyEditValues
                    selectedKey={this.state.key}
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
            disabled={!this.state.validState || this.state.submitting}
          >
              Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin"/>}
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState({
      key: {
        ...this.state.key,
        [property]: value
      }
    }, this._validateState);
  };

  // clear everything out on close
  private _closeModal = () => {
    this.setState({
      error: "",
      key: null,
      submitting: false,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({submitting: true})
    await this.props.onEdit(this.state.key);

    this._closeModal();
  };

  private _validateState = () => {
    let valid = true;
    let error = "";
    if (!this.state.key) {
      valid = false;
    } else if ( !this.state.key.code){
      valid = false;
      error = "You must give this key a name.";
    } else if(this.state.key.code.length > 64)
    {
      valid = false;
      error = "The name you have chosen is too long";
    }
    this.setState({ validState: valid, error });
  };
}
