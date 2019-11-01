import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IKey, keySchema } from '../../models/Keys';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
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
  error: IValidationError;
  key: IKey;
  submitting: boolean;
  validState: boolean;
}

export default class EditKey extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  private _formRef: React.RefObject<HTMLFormElement>;

  constructor(props) {
    super(props);

    this._formRef = React.createRef();

    this.state = {
      error: {
        message: '',
        path: ''
      },
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
                error={this.state.error}
              />
            </form>
          </div>
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
      error: {
        message: '',
        path: ''
      },
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
    const checkIfKeyCodeIsValid = this.props.checkIfKeyCodeIsValid;
    const error = yupAssetValidation(keySchema, this.state.key, {
      context: { checkIfKeyCodeIsValid }
    });
    this.setState({ error, validState: error.message === '' });
  };
}
