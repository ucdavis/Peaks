import * as React from 'react';
import { ModalBody, Modal, Button } from 'reactstrap';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

export const AssignDocument = (props: IProps): JSX.Element => {
  return (
    <div>
      <Modal
        isOpen={true}
        toggle={() => {}}
        size='lg'
        className='spaces-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
              Assign Document for Signature
          </h2>
          <Button color='link' onClick={() => {}}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <div className='container-fluid'></div>
        </ModalBody>
      </Modal>
    </div>
  );
};
