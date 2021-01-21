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
import { IBigFixSearchedName } from '../../models/Equipment';

interface IProps {
  addManagedSystemId: (property: string, id: string) => void;
}

const EquipmentManagedSystemSearchId = (props: IProps) => {
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isFound, setIsFound] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isValidSearch, setIsValidSearch] = useState<boolean>(true);
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [selectedField, setSelectedField] = useState<string>('Name');
  const [valueToBeSearched, setValueToBeSearched] = useState<string>('');
  const [listOfComputers, setListOfComputers] = useState<
    IBigFixSearchedName[]
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
          <h2>Search Computer Id</h2>
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
          <Label for='exampleSelect'>Field</Label>
          <Input
            type='select'
            name='select'
            id='field-select'
            onChange={e => changeSelectedInput(e.target.value)}
            value={selectedField}
          >
            <option value='Name'>Name</option>
          </Input>
        </FormGroup>

        <FormGroup>
          {renderInputSearch()}
          <FormFeedback>Computer name is required</FormFeedback>
        </FormGroup>

        {renderNameTable()}
      </Form>
    );
  };

  const renderInputSearch = () => {
    if (selectedField === 'Name') {
      return (
        <>
          <label>Name</label>
          <Input
            type='text'
            name='name'
            id='computer-name'
            placeholder='Enter Computer Name'
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
    } else if (selectedField === 'Id') {
      return (
        <Input
          type='text'
          name='Id'
          id='computer Id'
          placeholder='Enter Computer Id'
        />
      );
    } else if (selectedField === 'Company') {
      return (
        <Input
          type='text'
          name='Company'
          id='computer Company'
          placeholder='Enter Computer Company'
        />
      );
    }
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
                        {computer.hardware_display_name}
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
    getComputersBySearchId(selectedField, valueToBeSearched);
  };

  const getComputersBySearchId = async (field: string, value: string) => {
    let response = null;
    try {
      response = await context.fetch(
        `/api/${context.team.slug}/equipment/GetComputersBySearch?field=${field}&value=${value}`
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

  const changeSelectedInput = value => {
    setIsFetched(false);
    setIsFound(true);
    setIsValidSearch(true);
    setIsSearching(false);
    setListOfComputers([]);
    setSelectedField(value);
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
