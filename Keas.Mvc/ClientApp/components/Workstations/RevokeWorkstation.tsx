import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { AppContext, IWorkstation } from '../../Types';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  revokeWorkstation: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
}

interface IState {
  submitting: boolean;
}

export default class RevokeWorkstation extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };

  public context: AppContext;

  constructor(props) {
    super(props);

    this.state = {
      submitting: false
    };
  }

  public render() {
    if (
      !this.props.selectedWorkstation ||
      !this.props.selectedWorkstation.assignment
    ) {
      return null;
    }
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='spaces-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Revoke {this.props.selectedWorkstation.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>
          <ModalBody>
            <WorkstationEditValues
              selectedWorkstation={this.props.selectedWorkstation}
              disableEditing={true}
              disableSpaceEditing={true}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._revokeWorkstation}
              disabled={this.state.submitting}
            >
              Revoke
            </Button>
          </ModalFooter>
        </Modal>{' '}
      </div>
    );
  }

  private _revokeWorkstation = async () => {
    if (!this.props.selectedWorkstation) {
      return null;
    }
    this.setState({ submitting: true });
    try {
      await this.props.revokeWorkstation(this.props.selectedWorkstation);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this.setState({ submitting: false });
    this.props.closeModal();
  };
}
