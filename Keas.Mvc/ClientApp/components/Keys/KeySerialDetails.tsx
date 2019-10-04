import * as React from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IKey, IKeySerial } from '../../Types';
import HistoryContainer from '../History/HistoryContainer';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  isModalOpen: boolean;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  selectedKeySerial: IKeySerial;
  updateSelectedKeySerial: (keySerial: IKeySerial, id?: number) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

export default class KeyDetails extends React.Component<IProps, {}> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public componentDidMount() {
    if (!this.props.selectedKeySerial) {
      return;
    }
    this._fetchDetails(this.props.selectedKeySerial.id);
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
              Details for {selectedKeySerial.key.code}{' '}
              {selectedKeySerial.number}
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
            <HistoryContainer
              controller='keyserials'
              id={selectedKeySerial.id}
            />
          </ModalBody>
        </Modal>
      </div>
    );
  }

  private _fetchDetails = async (id: number) => {
    const url = `/api/${this.context.team.slug}/keySerials/details/${id}`;
    let keySerial: IKeySerial = null;
    try {
      keySerial = await this.context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The key serial you were trying to view could not be found. It may have been deleted.'
        );
        this.props.updateSelectedKeySerial(null, id);
        this.props.closeModal();
      } else {
        toast.error(
          'Error fetching key serial details. Please refresh the page to try again.'
        );
      }
      return;
    }
    this.props.updateSelectedKeySerial(keySerial);
  };
}
