import * as PropTypes from 'prop-types';
import * as React from 'react';
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
import { IBigFixSearchedName } from '../../Types';
import { threadId } from 'worker_threads';
import { isThisQuarter } from 'date-fns';

interface IProps {
  addBigFixId: (property: string, id: string) => void;
}

interface IState {
  isFetched: boolean;
  isFound: boolean;
  isSearching: boolean;
  isValidSearch: boolean;
  searchModal: boolean;
  selectedField: string;
  valueToBeSearched: string;
  listOfComputers: IBigFixSearchedName[];
}

export default class EquipmentBigFixSearchId extends React.Component<
  IProps,
  IState
> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      isFetched: false,
      isFound: true,
      isSearching: false,
      isValidSearch: true,
      listOfComputers: [],
      searchModal: false,
      selectedField: 'Name',
      valueToBeSearched: ''
    };
  }

  public render() {
    return (
      <>
        {this._renderInfoIcon()}
        {this._renderSearchModal()}
      </>
    );
  }

  private _renderInfoIcon = () => {
    return (
      <Button
        color='link'
        className='ml-1 mb-3 pt-0'
        onClick={() => {
          this._modalToggle();
        }}
      >
        <i className='fas fa-search fa-xs mr-2' />
        Look Up
      </Button>
    );
  };

  private _renderSearchModal = () => {
    return (
      <Modal
        isOpen={this.state.searchModal}
        toggle={this._modalToggle}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Search Computer Id</h2>
          <Button color='link' onClick={this._modalToggle}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody className='d-flex justify-content-center'>
          {this._renderModalBody()}
        </ModalBody>
        <ModalFooter>{this._renderSearchButton()}</ModalFooter>
      </Modal>
    );
  };

  private _renderModalBody = () => {
    return (
      <Form className='w-75'>
        <FormGroup className='mb-5'>
          <Label for='exampleSelect'>Field</Label>
          <Input
            type='select'
            name='select'
            id='field-select'
            onChange={e => this._changeSelectedInput(e.target.value)}
            value={this.state.selectedField}
          >
            <option value='Name'>Name</option>
          </Input>
        </FormGroup>

        <FormGroup>
          {this._renderInputSearch()}
          <FormFeedback>Computer name is required</FormFeedback>
        </FormGroup>

        {this._renderNameTable()}
      </Form>
    );
  };

  private _renderInputSearch = () => {
    if (this.state.selectedField === 'Name') {
      return (
        <>
          <label>Name</label>
          <Input
            type='text'
            name='name'
            id='computer-name'
            placeholder='Enter Computer Name'
            invalid={this.state.valueToBeSearched.length < 1}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            onChange={e => {
              this.setState({
                valueToBeSearched: e.target.value
              });
            }}
          />
        </>
      );
    } else if (this.state.selectedField === 'Id') {
      return (
        <Input
          type='text'
          name='Id'
          id='computer Id'
          placeholder='Enter Computer Id'
        />
      );
    } else if (this.state.selectedField === 'Company') {
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

  private _renderNameTable = () => {

    // after request, if fetched 
    if (this.state.isFetched) {

      // if no error occured except Not Found
      if (this.state.isValidSearch) {

        // if not NotFound error.
        if (this.state.isFound) {
          return (
            <Table>
              <tbody>
                {this.state.listOfComputers.map(computer => {
                  return (
                    <tr key={computer.id} className='bigfix-info border-bottom'>
                      <Button
                        color='link'
                        onClick={() =>
                          this.props.addBigFixId(
                            'systemManagementId',
                            computer.id
                          )
                        }
                      >
                        {computer.name}
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

  private _renderSearchButton = () => {
    if (this.state.isSearching) {
      return (
        <Button color='primary' disabled={false}>
          {' '}
          <i className='fas fa-lg fa-spinner fa-pulse' />
        </Button>
      );
    } else {
      return (
        <Button color='primary' disabled={false} onClick={this._onSearch}>
          Search!
        </Button>
      );
    }
  };

  private _onSearch = () => {
    this.setState({
      isSearching: true,
      isFetched: false,
      isFound: true,
      isValidSearch: true,
      listOfComputers: []
    });
    this._getComputersBySearchId(
      this.state.selectedField,
      this.state.valueToBeSearched
    );
  };

  private _getComputersBySearchId = async (field: string, value: string) => {
    let response = null;
    try {
      response = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/GetComputersBySearch?field=${field}&value=${value}`
      );
    } catch (err) {
      debugger;
      if (err.message === 'Not Found') {
        this.setState({
          isFetched: true,
          isSearching: false,
          isFound: false
        });
      } else {
        this.setState({
          isFetched: true,
          isSearching: false,
          isValidSearch: false
        });
        toast.error(
          'Error fetching Names. Please refresh the page to try again.'
        );
      }

      return;
    }

    const firstFiveName = response.slice(0, 5);
    this.setState({
      isFetched: true,
      isSearching: false,
      listOfComputers: firstFiveName
    });
  };

  private _changeSelectedInput = value => {
    this.setState({
      isFetched: false,
      isFound: true,
      isValidSearch: true,
      isSearching: false,
      listOfComputers: [],
      selectedField: value
    });
  };

  private _modalToggle = () => {
    this.setState(prevState => ({
      isFetched: false,
      isFound: true,
      isValidSearch: true,
      listOfComputers: [],
      valueToBeSearched: '',
      searchModal: !prevState.searchModal
    }));
  };
}
