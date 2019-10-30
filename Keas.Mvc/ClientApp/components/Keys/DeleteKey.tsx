import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IKey, IKeyInfo } from '../../models/Keys';
import KeyEditValues from './KeyEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  deleteKey: (key: IKey) => void;
  selectedKeyInfo: IKeyInfo;
}

interface IState {
  submitting: boolean;
}

export default class DeleteKey extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      submitting: false
    };
  }

  public render() {
    if (!this.props.selectedKeyInfo) {
      return null;
    }
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='key-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Delete {this.props.selectedKeyInfo.key.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <KeyEditValues
              selectedKey={this.props.selectedKeyInfo.key}
              disableEditing={true}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._deleteKey}
              disabled={this.state.submitting}
            >
              Go!{' '}
              {this.state.submitting && (
                <i className='fas fa-circle-notch fa-spin' />
              )}
            </Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _deleteKey = async () => {
    if (
      !!this.props.selectedKeyInfo.serialsInUseCount &&
      !confirm(
        'This key has serials that are currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }
    this.setState({ submitting: true });
    try {
      await this.props.deleteKey(this.props.selectedKeyInfo.key);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this.setState({ submitting: false });
    this.props.closeModal();
  };
}
