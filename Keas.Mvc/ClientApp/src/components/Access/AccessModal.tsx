import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

interface IProps {
  header?: React.ReactChild;
  footer?: React.ReactChild;
  isOpen: boolean;
  closeModal: () => void;
}

const AccessModal: React.FunctionComponent<IProps> = (
  props: React.PropsWithChildren<IProps>
): React.ReactElement => {
  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.closeModal}
      size='lg'
      className='access-color'
      scrollable={true}
    >
      <div className='modal-header row justify-content-between'>
        {props.header}
        <Button color='link' onClick={props.closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>{props.children}</ModalBody>
      <ModalFooter>{props.footer}</ModalFooter>
    </Modal>
  );
};

export default AccessModal;
