import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IKeySerial, keySerialSchema } from '../../models/KeySerials';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  selectedKeySerial: IKeySerial;
  statusList: string[];
  isModalOpen: boolean;
  onEdit: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  closeModal: () => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
  checkIfKeySerialNumberIsValid: (serialNumber: string, id: number) => boolean;
}

interface IState {
  error: string;
  keySerial: IKeySerial;
  submitting: boolean;
  validState: boolean;
}

export default class EditKeySerial extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props: IProps) {
    super(props);
    this.state = {
      error: '',
      keySerial: this.props.selectedKeySerial,
      submitting: false,
      validState: false
    };
  }

  public render() {
    if (!this.state.keySerial) {
      return null;
    }

    return (
      <Modal
        isOpen={this.props.isModalOpen}
        toggle={this._confirmClose}
        size='lg'
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            Edit Serial {this.props.selectedKeySerial.key.code}{' '}
            {this.props.selectedKeySerial.number}
          </h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <form>
              <KeySerialEditValues
                keySerial={this.state.keySerial}
                changeProperty={this._changeProperty}
                disableEditing={false}
                statusList={this.props.statusList}
                goToKeyDetails={this.props.goToKeyDetails}
              />

              <KeySerialAssignmentValues
                selectedKeySerial={this.props.selectedKeySerial}
                openUpdateModal={this.props.openUpdateModal}
              />

              {this.state.error && (
                <span className='color-unitrans'>{this.state.error}</span>
              )}
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
        keySerial: {
          ...this.state.keySerial,
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
      keySerial: null,
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
      await this.props.onEdit(this.state.keySerial);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    try {
      const validcheck = keySerialSchema.validateSync(this.state.keySerial, {
        context: {
          checkIfKeySerialNumberIsValid: this.props
            .checkIfKeySerialNumberIsValid
        }
      });
      this.setState({ error: '', validState: true });
    } catch (err) {
      this.setState({ error: err.message, validState: false });
    }
  };
}
