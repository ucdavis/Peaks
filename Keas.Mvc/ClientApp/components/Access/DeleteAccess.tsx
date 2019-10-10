import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../Types';
import AccessEditValues from './AccessEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  deleteAccess: (access: IAccess) => void;
  selectedAccess: IAccess;
  onRevoke: (accessAssignment: IAccessAssignment) => void;
}

interface IState {
  submitting: boolean;
}

export default class DeleteAccess extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      submitting: false
    };
  }

  public render() {
    if (!this.props.selectedAccess) {
      return null;
    }
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='access-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Delete {this.props.selectedAccess.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <AccessEditValues
              selectedAccess={this.props.selectedAccess}
              disableEditing={true}
              onRevoke={this.props.onRevoke}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._deleteAccess}
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

  private _deleteAccess = async () => {
    if (
      this.props.selectedAccess.assignments.length > 0 &&
      !confirm(
        'This access is currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.deleteAccess(this.props.selectedAccess);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this.setState({ submitting: false });
    this.props.closeModal();
  };
}
