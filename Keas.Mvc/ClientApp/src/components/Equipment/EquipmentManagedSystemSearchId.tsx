import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Form, FormFeedback, FormGroup, Input, Table } from 'reactstrap';
import { Context } from '../../Context';
import { IManagedSystemSearchedName } from '../../models/Equipment';

interface IProps {
  addManagedSystemId: (property: string, id: string) => void;
}

const EquipmentManagedSystemSearchId = (props: IProps) => {
  const [isFetched, setIsFetched] = useState<boolean>(false);
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
        <MagnifyingGlassIcon data-icon="magnifying-glass" className='hero-icon size-4 mr-2' />
        Look Up
      </Button>
    );
  };

  const renderSearchModal = () => {
    return (
      <Modal
        isOpen={searchModal}
        toggle={modalToggle}
        className='equipment-color'
      >
        <ModalHeading>Search by Computer Property</ModalHeading>

        <ModalBody>
          {renderModalBody()}
        </ModalBody>
        <ModalFooter>{renderSearchButton()}</ModalFooter>
      </Modal>
    );
  };

  const renderModalBody = () => {
    return (
      <Form className='w-full space-y-5'>
        <FormGroup className='mb-5'>
          <h3 className="text-lg font-semibold">Searchable Properties:</h3>
          <p>
            Computer Name, LoginID, IP Address, Mac Address, or Serial Number
          </p>
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
        // If listOfComputers' length is not 0 then  display the computers, else display an error message
        if (!!listOfComputers && listOfComputers.length > 0) {
          return (
            <Table>
              <tbody>
                {listOfComputers.map(computer => {
                  return (
                    <tr
                      key={computer.hardware_u_bigfix_id}
                      className='border-b border-main-border'
                    >
                      <td>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          );
        }
        // if listOfComputers is 0
        return <p>No results found for the search term.</p>;
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
        <Button color='asset' disabled={false}>
          {' '}
          <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-6 animate-spin' />
        </Button>
      );
    } else {
      return (
        <Button color='asset' disabled={false} onClick={onSearch}>
          Search!
        </Button>
      );
    }
  };

  const onSearch = () => {
    setIsSearching(true);
    setIsFetched(false);
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
