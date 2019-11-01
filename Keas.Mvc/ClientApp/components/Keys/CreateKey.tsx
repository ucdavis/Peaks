import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { ValidationError } from 'yup';
import { Context } from '../../Context';
import { IKey, keySchema } from '../../models/Keys';
import { IValidationError } from '../../models/Shared';
import KeyEditValues from './KeyEditValues';

interface IProps {
  onCreate: (key: IKey) => void;
  modal: boolean;
  onOpenModal: () => void;
  closeModal: () => void;
  searchableTags: string[];
  checkIfKeyCodeIsValid: (code: string) => boolean;
}

interface IState {
  error: IValidationError;
  key: IKey;
  submitting: boolean;
  validState: boolean;
}

export default class CreateKey extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  private _formRef: React.RefObject<HTMLFormElement>;

  constructor(props: IProps) {
    super(props);

    this._formRef = React.createRef();

    this.state = {
      error: {
        message: '',
        path: ''
      },
      key: {
        code: '',
        id: 0,
        name: '',
        notes: '',
        serials: [],
        tags: '',
        teamId: 0
      },
      submitting: false,
      validState: false
    };
  }

  public render() {
    return (
      <div>
        <Button color='link' onClick={this.props.onOpenModal}>
          <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Key
        </Button>
        {this.renderModal()}
      </div>
    );
  }

  private renderModal() {
    const { searchableTags } = this.props;

    return (
      <Modal
        isOpen={this.props.modal}
        toggle={this._confirmClose}
        size='lg'
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Create Key</h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <form ref={this._formRef}>
            <KeyEditValues
              selectedKey={this.state.key}
              changeProperty={this._changeProperty}
              disableEditing={false}
              searchableTags={searchableTags}
              error={this.state.error}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={this._editSelected}
            disabled={!this.state.validState || this.state.submitting}
          >
            Go!
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin ml-2' />
            )}
          </Button>
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
      error: { message: '', path: '' },
      key: {
        code: '',
        id: 0,
        name: '',
        notes: '',
        serials: [],
        tags: '',
        teamId: 0
      },
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

    this.setState({ submitting: true });
    try {
      await this.props.onCreate(this.state.key);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    // yup schemas will throw if an error was found
    try {
      const validKey = keySchema.validateSync(this.state.key, {
        context: {
          checkIfKeyCodeIsValid: this.props.checkIfKeyCodeIsValid
        }
      });
      this.setState({
        error: {
          message: '',
          path: ''
        },
        validState: true
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        this.setState({
          error: {
            message: err.message,
            path: err.path
          },
          validState: false
        });
      } else {
        this.setState({
          error: {
            message: err.message,
            path: ''
          },
          validState: false
        });
      }
    }
  };
}
