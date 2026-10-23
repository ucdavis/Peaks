import { ArrowPathIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, Table } from 'reactstrap';
import { Context } from '../../Context';

interface IProps {
  managedSystemId: string;
}

const EquipmentManagedSystemInfo = (props: IProps) => {
  const [managedSystemModal, setManagedSystemModal] = useState<boolean>(false);
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
          getManagedSystemComputerInfo(props.managedSystemId || '');
        }}
      >
        <InformationCircleIcon data-icon="information-circle" className='hero-icon size-5 ml-2' />
      </a>
    );
  };

  const renderManagedSystemModal = () => {
    return (
      <Modal
        isOpen={managedSystemModal}
        toggle={modalToggle}
        size='lg'
        className='equipment-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Computer Details</h2>
          <Button color='link' onClick={modalToggle}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody className='p-6 flex justify-center'>
          {renderModalBody()}
        </ModalBody>
      </Modal>
    );
  };

  const renderModalBody = () => {
    if (isFetched) {
      return renderComputerInfo();
    } else {
      return <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-12 animate-spin' />;
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
            Not a valid Managed System id, please make sure to enter a valid
            Managed System id.
          </p>
        );
      }
    }

    return <p>No data to present</p>;
  };

  const getManagedSystemComputerInfo = async (id: string) => {
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

    const sortedResult = Object.keys(response.result[0])
      .sort()
      .reduce((accumulator, currentValue) => {
        const key = currentValue.replace('hardware_', '');
        accumulator[key] = response.result[0][currentValue];
        return accumulator;
      }, {});

    setComputerInfo(sortedResult);
    setIsFetched(true);
  };

  const modalToggle = () => {
    // reset the states to its initial values.
    setManagedSystemModal(prevModal => !prevModal);
    setIsFetched(false);
    setIsFound(true);
    setIsForbidden(false);
    setIsValidRequest(true);
  };

  return (
    <>
      {renderInfoIcon()}

      {renderManagedSystemModal()}
    </>
  );
};

export default EquipmentManagedSystemInfo;
