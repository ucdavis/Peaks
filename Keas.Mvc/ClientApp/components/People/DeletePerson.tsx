import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson, IPersonInfo } from '../../models/People';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onDelete: (person: IPerson) => void;
  selectedPersonInfo: IPersonInfo;
}

interface IState {
  modal: boolean;
  submitting: boolean;
}

export default class DeletePerson extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      submitting: false
    };
  }

  public render() {
    if (
      !this.props.selectedPersonInfo ||
      !this.props.selectedPersonInfo.person
    ) {
      return null;
    }
    return (
      <div>
        <Button className='btn btn-link' onClick={this._toggleModal}>
          <i className='fas fa-trash fa-sm fa-fw mr-2' aria-hidden='true' />
          Delete Person
        </Button>
        <Modal
          isOpen={this.state.modal}
          toggle={this._toggleModal}
          size='lg'
          className='person-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Delete {this.props.selectedPersonInfo.person.name}</h2>
            <Button color='link' onClick={this._toggleModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <PersonEditValues
              selectedPerson={this.props.selectedPersonInfo.person}
              disableEditing={true}
              isDeleting={true}
            />
            {!this._checkValidToDelete() && (
              <div>
                The person you have selected currently has assets assigned to
                them. Please revoke everything before deleting.
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._deletePerson}
              disabled={this.state.submitting || !this._checkValidToDelete()}
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

  private _checkValidToDelete = () => {
    return !(
      this.props.selectedPersonInfo.accessCount > 0 ||
      this.props.selectedPersonInfo.equipmentCount > 0 ||
      this.props.selectedPersonInfo.keyCount > 0 ||
      this.props.selectedPersonInfo.workstationCount > 0
    );
  };

  private _deletePerson = async () => {
    if (!this._checkValidToDelete()) {
      return;
    }
    this.setState({ submitting: true });
    try {
      await this.props.onDelete(this.props.selectedPersonInfo.person);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    // do not need to manage state here since it is unmounted after delete
    this.setState({ submitting: false });
    this._toggleModal();
  };

  private _toggleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  };
}
