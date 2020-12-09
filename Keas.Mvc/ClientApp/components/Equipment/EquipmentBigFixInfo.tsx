import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, Table } from 'reactstrap';
import { Context } from '../../Context';

interface IProps {
  bigfixId: string;
}

const EquipmentBigFixInfo = (props: IProps) => {
  const [bigfixModal, setBigfixModal] = useState<boolean>(false);
  const [computerInfo, setComputerInfo] = useState<object>({});
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isFound, setIsFound] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [isValidRequest, setIsValidRequest] = useState<boolean>(true);
  const context = useContext(Context);

  const renderInfoIcon = () => {
    return (
      <a
        className='bigfix-info'
        onClick={() => {
          modalToggle();
          getBigFixComputerInfo(props.bigfixId || '');
        }}
      >
        <i className='fas fa-info-circle ml-2' />
      </a>
    );
  };

  const renderBigFixModal = () => {
    return (
      <Modal
        isOpen={bigfixModal}
        toggle={modalToggle}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Computer Details</h2>
          <Button color='link' onClick={modalToggle}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody className='d-flex justify-content-center'>
          {renderModalBody()}
        </ModalBody>
      </Modal>
    );
  };

  const renderModalBody = () => {
    if (isFetched) {
      return renderComputerInfo();
    } else {
      return <i className='fas fa-3x fa-spinner fa-pulse' />;
    }
  };

  const renderComputerInfo = () => {
    if (isValidRequest) {
      // if found
      if (isFound) {
        return (
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(computerInfo).map(key => {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{computerInfo[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      } else if (isForbidden) {
        return <p>Error fetching Computer details due to permissions issue.</p>;
      } else {
        return (
          <p>
            Not a valid Bigfix id, please make sure to enter a valid Bigfix id.
          </p>
        );
      }
    }

    return <p>No data to present</p>;
  };

  const getBigFixComputerInfo = async (id: string) => {
    let response = null;
    try {
      response = await context.fetch(
        `/api/${context.team.slug}/equipment/GetComputer/${id}`
      );
    } catch (err) {
      if (err.message === 'Not Found') {
        setIsFetched(true);
        setIsFound(false);
      } else if (err.message === 'Forbidden') {
        setIsFetched(true);
        setIsFound(false);
        setIsForbidden(true);
      } else {
        setIsFetched(true);
        setIsValidRequest(false);
        toast.error(
          'Error fetching Computer details. Please refresh the page to try again.'
        );
      }

      return;
    }
    console.log(response)

    const sortedResult = Object.keys(response)
      .sort()
      .reduce((accumulator, currentValue) => {
        accumulator[currentValue] = response[currentValue];
        return accumulator;
      }, {});

    setComputerInfo(sortedResult);
    setIsFetched(true);
  };

  const modalToggle = () => {
    // reset the states to its initial values.
    setBigfixModal(prevModal => !prevModal);
    setIsFetched(false);
    setIsFound(true);
    setIsForbidden(false);
    setIsValidRequest(true);
  };

  return (
    <>
      {renderInfoIcon()}

      {renderBigFixModal()}
    </>
  );
};

export default EquipmentBigFixInfo;
