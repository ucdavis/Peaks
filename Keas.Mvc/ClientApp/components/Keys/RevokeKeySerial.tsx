import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKey, IKeySerial } from '../../Types';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  isModalOpen: boolean;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  onRevoke: (keySerial: IKeySerial) => void;
  selectedKeySerial: IKeySerial;
  updateSelectedKeySerial: (keySerial: IKeySerial) => void;
  goToKeyDetails: (key: IKey) => void;
}

interface IState {
  submitting: boolean;
}

export default class RevokeKeySerial extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false
    };
  }

  public render() {
    const { selectedKeySerial } = this.props;

    if (!selectedKeySerial) {
      return null;
    }

    return (
      <div>
        <Modal
          isOpen={this.props.isModalOpen}
          toggle={this.props.closeModal}
          size='lg'
          className='keys-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>
              Revoke for {selectedKeySerial.key.code} {selectedKeySerial.number}
            </h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>
          <ModalBody>
            <KeySerialEditValues
              keySerial={selectedKeySerial}
              disableEditing={true}
              openEditModal={this.props.openEditModal}
              goToKeyDetails={this.props.goToKeyDetails}
            />
            <KeySerialAssignmentValues
              selectedKeySerial={selectedKeySerial}
              openUpdateModal={this.props.openUpdateModal}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={() => this._revokeKeySerial()}
              disabled={!this._isValidToRevoke() || this.state.submitting}
            >
              Revoke{' '}
              {this.state.submitting && (
                <i className='fas fa-circle-notch fa-spin' />
              )}
            </Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _revokeKeySerial = async () => {
    if (!this._isValidToRevoke()) {
      return;
    }
    this.setState({ submitting: true });
    try {
      await this.props.onRevoke(this.props.selectedKeySerial);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this.setState({ submitting: false });
    this.props.closeModal();
  };

  private _isValidToRevoke = () => {
    return (
      !!this.props.selectedKeySerial &&
      !!this.props.selectedKeySerial.keySerialAssignment
    );
  };
}
