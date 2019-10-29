import * as React from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, Table } from 'reactstrap';
import { Context } from '../../Context';

interface IProps {
  bigfixId: string;
}

interface IState {
  bigfixModal: boolean;
  computerInfo: object;
  isFetched: boolean;
  isValidRequest: boolean;
  isFound: boolean;
}

export default class EquipmentBigFixInfo extends React.Component<
  IProps,
  IState
> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      bigfixModal: false,
      computerInfo: {},
      isFetched: false,
      isFound: true,
      isValidRequest: true
    };
  }

  public render() {
    return (
      <>
        {this._renderInfoIcon()}

        {this._renderBigFixModal()}
      </>
    );
  }

  private _renderInfoIcon = () => {
    return (
      <a
        className='bigfix-info'
        onClick={() => {
          this._modalToggle();
          this._getBigFixComputerInfo(this.props.bigfixId || '');
        }}
      >
        <i className='fas fa-info-circle ml-2' />
      </a>
    );
  };

  private _renderBigFixModal = () => {
    return (
      <Modal
        isOpen={this.state.bigfixModal}
        toggle={this._modalToggle}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Computer Details</h2>
          <Button color='link' onClick={this._modalToggle}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody className='d-flex justify-content-center'>
          {this._renderModalBody()}
        </ModalBody>
      </Modal>
    );
  };

  private _renderModalBody = () => {
    if (this.state.isFetched) {
      return this._renderComputerInfo();
    } else {
      return <i className='fas fa-3x fa-spinner fa-pulse' />;
    }
  };

  private _renderComputerInfo = () => {
    if (this.state.isValidRequest) {
      // if found
      if (this.state.isFound) {
        return (
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.computerInfo).map(key => {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{this.state.computerInfo[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      }

      // if not found
      return (
        <p>
          Not a valid Bigfix id, please make sure to enter a valid Bigfix id.
        </p>
      );
    }

    return <p>No data to present</p>;
  };

  private _getBigFixComputerInfo = async (id: string) => {
    let response = null;
    try {
      response = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/GetComputer/${id}`
      );
    } catch (err) {
      if (err.message === 'Not Found') {
        this.setState({
          isFetched: true,
          isFound: false
        });
      } else {
        this.setState({
          isFetched: true,
          isValidRequest: false
        });
        toast.error(
          'Error fetching Computer details. Please refresh the page to try again.'
        );
      }

      return;
    }

    const sortedResult = Object.keys(response)
      .sort()
      .reduce((accumulator, currentValue) => {
        accumulator[currentValue] = response[currentValue];
        return accumulator;
      }, {});

    this.setState({
      computerInfo: sortedResult,
      isFetched: true
    });
  };

  private _modalToggle = () => {
    // reset the states to its initial values.
    this.setState(prevState => ({
      bigfixModal: !prevState.bigfixModal,
      isFetched: false,
      isFound: true,
      isValidRequest: true
    }));
  };
}
