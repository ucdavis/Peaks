import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IPerson, IPersonInfo } from '../../models/People';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onDelete: (person: IPerson) => void;
  selectedPersonInfo: IPersonInfo;
}

const DeletePerson = (props: IProps) => {
  const [modal, setModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedPersonInfo || !props.selectedPersonInfo.person) {
    return null;
  }

  const checkValidToDelete = () => {
    return !(
      props.selectedPersonInfo.accessCount > 0 ||
      props.selectedPersonInfo.equipmentCount > 0 ||
      props.selectedPersonInfo.keyCount > 0 ||
      props.selectedPersonInfo.workstationCount > 0
    );
  };

  const deletePerson = async () => {
    if (!checkValidToDelete()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onDelete(props.selectedPersonInfo.person);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    // do not need to manage state here since it is unmounted after delete
    setSubmitting(false);
    toggleModal();
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <div>
      <Button color="link" onClick={toggleModal}>
        <i className="fas fa-trash fa-sm fa-fw mr-2" aria-hidden="true" />
        Delete Person
      </Button>
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        size="lg"
        className="people-color"
      >
        <div className="modal-header row justify-content-between">
          <h2>Delete {props.selectedPersonInfo.person.name}</h2>
          <Button color="link" onClick={toggleModal}>
            <i className="fas fa-times fa-lg" />
          </Button>
        </div>

        <ModalBody>
          <PersonEditValues
            selectedPerson={props.selectedPersonInfo.person}
            disableEditing={true}
            isDeleting={true}
          />
          {!checkValidToDelete() && (
            <div>
              The person you have selected currently has assets assigned to
              them. Please revoke everything before deleting.
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={deletePerson}
            disabled={submitting || !checkValidToDelete()}
          >
            Go! {submitting && <i className="fas fa-circle-notch fa-spin" />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeletePerson;
