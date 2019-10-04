import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { AppContext, IKey } from '../../Types';
import KeyEditValues from './KeyEditValues';

interface IProps {
  onEdit: (key: IKey) => void;
  modal: boolean;
  closeModal: () => void;
  selectedKey: IKey;
  searchableTags: string[];
  checkIfKeyCodeIsValid: (code: string, id: number) => boolean;
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

  private _formRef: React.RefObject<HTMLFormElement>;

  constructor(props) {
    super(props);

    this._formRef = React.createRef();

    this.state = {
      error: '',
      key: this.props.selectedKey,
      submitting: false,
      validState: false
    };
  }

  public render() {
    if (!this.state.key) {
      return null;
    }

    const { searchableTags } = this.props;

    return (
      <Modal
        isOpen={this.props.modal}
        toggle={this._confirmClose}
        size='lg'
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Edit Key</h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <form ref={this._formRef}>
              <KeyEditValues
                selectedKey={this.state.key}
                changeProperty={this._changeProperty}
                disableEditing={false}
                searchableTags={searchableTags}
              />
            </form>
          </div>
          {this.state.error}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={this._editSelected}
            disabled={!this.state.validState || this.state.submitting}
          >
            Go!{' '}
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin' />
            )}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState(
      {
        key: {
          ...this.state.key,
          [property]: value
        }
      },
      this._validateState
    );
  };

  // clear everything out on close
  private _confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({
      error: '',
      key: null,
      submitting: false,
      validState: false
    });
    this.props.closeModal();
  };

  private _editSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.onEdit(this.state.key);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    const { key } = this.state;

    let valid = this._formRef.current.checkValidity();
    let error = '';

    if (!key) {
      valid = false;
    } else if (!key.code) {
      valid = false;
      error = 'You must give this key a name.';
    } else if (key.code.length > 64) {
      valid = false;
      error = 'The name you have chosen is too long';
    } else if (!this.props.checkIfKeyCodeIsValid(key.code, key.id)) {
      valid = false;
      error = 'The code you have chosen is already in use.';
    }

    this.setState({ validState: valid, error });
  };
}
