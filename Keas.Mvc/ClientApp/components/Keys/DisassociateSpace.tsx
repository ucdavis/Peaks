import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKeyInfo, ISpace } from '../../Types';
import KeyEditValues from './KeyEditValues';

interface IProps {
  onDisassociate: (key: IKeyInfo, space: ISpace) => void;
  closeModal: () => void;

  isModalOpen: boolean;
  selectedKeyInfo: IKeyInfo;
  selectedSpace: ISpace;
}

interface IState {
  submitting: boolean;
}

export default class DisassociateSpace extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      submitting: false
    };
  }

  public render() {
    const className = this.props.selectedKeyInfo ? '' : 'keys-anomaly'; // purple on keys/details
    return <div>{this.renderModal()}</div>;
  }

  private renderModal() {
    const { isModalOpen, selectedKeyInfo, selectedSpace } = this.props;
    if (!selectedKeyInfo || !selectedSpace) {
      return;
    }
    const { submitting } = this.state;

    return (
      <Modal
        isOpen={isModalOpen}
        toggle={this._closeModal}
        size='lg'
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Disassociate Key and Space</h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <h2>Key</h2>
          <KeyEditValues
            selectedKey={selectedKeyInfo.key}
            disableEditing={true}
          />
          <h2>Space</h2>
          <div>
            <div className='form-group'>
              <label>Room Number and Building</label>
              <input
                className='form-control'
                disabled={true}
                value={selectedSpace.roomNumber + ' ' + selectedSpace.bldgName}
              />
            </div>
            <div className='form-group'>
              <label>Room Name</label>
              <input
                className='form-control'
                disabled={true}
                value={selectedSpace.roomName ? selectedSpace.roomName : ''}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={this._disassociateKeyAndSpace}
            disabled={submitting}
          >
            Go!
            {submitting && <i className='fas fa-circle-notch fa-spin ml-2' />}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // default everything out on close
  private _disassociateKeyAndSpace = async () => {
    this.setState({
      submitting: false
    });
    try {
      await this.props.onDisassociate(
        this.props.selectedKeyInfo,
        this.props.selectedSpace
      );
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({ submitting: false });
    this.props.closeModal();
  };
}
