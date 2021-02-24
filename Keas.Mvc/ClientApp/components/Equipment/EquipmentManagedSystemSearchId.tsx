import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  Table
} from 'reactstrap';
import { Context } from '../../Context';
import { IManagedSystemSearchedName } from '../../models/Equipment';

interface IProps {
  addManagedSystemId: (property: string, id: string) => void;
}

const EquipmentManagedSystemSearchId = (props: IProps) => {
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isFound, setIsFound] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isValidSearch, setIsValidSearch] = useState<boolean>(true);
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [valueToBeSearched, setValueToBeSearched] = useState<string>('');
  const [listOfComputers, setListOfComputers] = useState<
    IManagedSystemSearchedName[]
  >();
  const context = useContext(Context);

  const renderInfoIcon = () => {
    return (
      <Button
        color='link'
        className='ml-1 mb-3 pt-0'
        onClick={() => {
          modalToggle();
        }}
      >
        <i className='fas fa-search fa-xs mr-2' />
        Look Up
      </Button>
    );
  };

  const renderSearchModal = () => {
    return (
      <Modal
        isOpen={searchModal}
        toggle={modalToggle}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Search by Computer Property</h2>
          <Button color='link' onClick={modalToggle}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody className='d-flex justify-content-center'>
          {renderModalBody()}
        </ModalBody>
        <ModalFooter>{renderSearchButton()}</ModalFooter>
      </Modal>
    );
  };

  const renderModalBody = () => {
    return (
      <Form className='w-75'>
        <FormGroup className='mb-5'>
            <h3>Search for computer name, loginID, ip address, mac address, or serial number </h3>
        </FormGroup>

        <FormGroup>
          {renderInputSearch()}
          <FormFeedback>Computer property is required</FormFeedback>
        </FormGroup>

        {renderNameTable()}
      </Form>
    );
  };

  const renderInputSearch = () => {
    return (
      <>
        <label>Computer Property</label>
        <Input
          type='text'
          name='property'
          id='computer-name'
          placeholder='Enter a Computer Property'
          invalid={valueToBeSearched.length < 1}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          onChange={e => {
            setValueToBeSearched(e.target.value);
          }}
        />
      </>
    );
  };

  const renderNameTable = () => {
    // after request, if fetched
    if (isFetched) {
      // if no error occured except Not Found
      if (isValidSearch) {
        // if not NotFound error.
        if (isFound) {
          return (
            <Table>
              <tbody>
                {listOfComputers.map(computer => {
                  return (
                    <tr
                      key={computer.hardware_u_bigfix_id}
                      className='bigfix-info border-bottom'
                    >
                      <Button
                        color='link'
                        onClick={() =>
                          props.addManagedSystemId(
                            'systemManagementId',
                            computer.hardware_u_bigfix_id
                          )
                        }
                      >
                        {computer.hardware_display_name} (
                        {computer.hardware_u_device_name})
                      </Button>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          );
        }
        // if NotFound error.
        return <p>Not a valid Name, please make sure to enter a valid Name.</p>;
      }
      // if other errors accurs. also toast error is displayed.
      return <p className='text-center'>No data to present.</p>;
    }
    // default, if no request has happend yet.
    return null;
  };

  const renderSearchButton = () => {
    if (isSearching) {
      return (
        <Button color='primary' disabled={false}>
          {' '}
          <i className='fas fa-lg fa-spinner fa-pulse' />
        </Button>
      );
    } else {
      return (
        <Button color='primary' disabled={false} onClick={onSearch}>
          Search!
        </Button>
      );
    }
  };

  const onSearch = () => {
    setIsSearching(true);
    setIsFetched(false);
    setIsFound(true);
    setIsValidSearch(true);
    setListOfComputers([]);
    getComputersBySearchId(valueToBeSearched);
  };

  const getComputersBySearchId = async (value: string) => {
    let response = null;
    try {
      response = await context.fetch(
        `/api/${context.team.slug}/equipment/GetComputersBySearch?value=${value}`
      );
    } catch (err) {
      if (err.message === 'Not Found') {
        setIsFetched(true);
        setIsSearching(false);
        setIsFound(false);
      } else {
        setIsFetched(true);
        setIsSearching(false);
        setIsValidSearch(false);
        toast.error(
          'Error fetching Names. Please refresh the page to try again.'
        );
      }

      return;
    }

    setIsFetched(true);
    setIsSearching(false);
    setListOfComputers(response.result);
  };

  const modalToggle = () => {
    setIsFetched(false);
    setIsFound(true);
    setIsValidSearch(true);
    setListOfComputers([]);
    setValueToBeSearched('');
    setSearchModal(prevModal => !prevModal);
  };

  return (
    <>
      {renderInfoIcon()}
      {renderSearchModal()}
    </>
  );
};

export default EquipmentManagedSystemSearchId;
