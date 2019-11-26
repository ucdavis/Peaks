import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { accessSchema, IAccess } from '../../models/Access';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AccessEditValues from './AccessEditValues';

interface IProps {
  onEdit: (access: IAccess) => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  tags: string[];
}

interface IState {
  error: IValidationError;
  access: IAccess;
  submitting: boolean;
  validState: boolean;
}

export default class EditAccess extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      access: this.props.selectedAccess,
      error: {
        message: '',
        path: ''
      },
      submitting: false,
      validState: false
    };
  }

  public render() {
    if (!this.state.access) {
      return null;
    }
    return (
      <Modal
        isOpen={this.props.modal}
        toggle={this._confirmClose}
        size='lg'
        className='access-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Edit Access</h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <form>
              <AccessEditValues
                selectedAccess={this.state.access}
                disableEditing={false}
                onAccessUpdate={access =>
                  this.setState({ access }, this._validateState)
                }
                tags={this.props.tags}
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

  // clear everything out on close
  private _confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({
      access: null,
      error: {
        message: '',
        path: ''
      },
      submitting: false,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected access even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.onEdit(this.state.access);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    const error = yupAssetValidation(accessSchema, this.state.access);
    this.setState({ error, validState: error.message === '' });
  };
}
