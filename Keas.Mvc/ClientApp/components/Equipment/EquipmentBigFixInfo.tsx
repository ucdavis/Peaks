import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, Table } from "reactstrap";
import EquipmentBigFixSearchId from "./EquipmentBigFixSearchId";

interface IProps {
    bigfixId: string;
    addBigFixId: (property: string, id: string) => void;
    disableEditing: boolean;
}

interface IState {
    bigfixModal: boolean;
    computerInfo: object;
    isFetched: boolean;
    isValidRequest: boolean;
}

export default class EquipmentBigFixInfo extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        permissions: PropTypes.array,
        router: PropTypes.object,
        team: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            bigfixModal: false,
            computerInfo: {},
            isFetched: false,
            isValidRequest: true
        };
    }

    public render() {
        return (
            <>
                <div className="d-flex">
                    <label> Bigfix Id</label>
                    <span />
                    {this._renderInfoIcon()}
                </div>

                {this._renderBigFixModal()}
            </>
        );
    }

    private _renderInfoIcon = () => {
        if (!this.props.bigfixId) {
            if (this.props.disableEditing) {
                return (
                    <span className="ml-3">
                        ( Click Edit Equipment above to search for Bigfix Id )
                    </span>
                );
            }
            return <EquipmentBigFixSearchId addBigFixId={this.props.addBigFixId} />;
        }

        return (
            <a
                className="bigfix-info"
                onClick={() => {
                    this._modalToggle();
                    this._getBigFixComputerInfo(this.props.bigfixId || "");
                }}
            >
                <i className="fas fa-info-circle ml-2" />
            </a>
        );
    };

    private _renderBigFixModal = () => {
        return (
            <Modal
                isOpen={this.state.bigfixModal}
                toggle={this._modalToggle}
                size="lg"
                className="equipment-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>Computer Details</h2>
                    <Button color="link" onClick={this._modalToggle}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>

                <ModalBody className="d-flex justify-content-center">
                    {this._renderModalBody()}
                </ModalBody>
            </Modal>
        );
    };

    private _renderModalBody = () => {
        if (this.state.isFetched) {
            return this._renderComputerInfo();
        } else {
            return <i className="fas fa-3x fa-spinner fa-pulse" />;
        }
    };

    private _renderComputerInfo = () => {
        if (this.state.isValidRequest) {
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

        return <p>Not a valid Bigfix id, please make sure to enter a valid Bigfix id.</p>;
    };

    private _getBigFixComputerInfo = async (id: string) => {
        const response = await fetch(`/api/${this.context.team.slug}/equipment/GetComputer/${id}`, {
            method: "GET"
        });

        if (!response.ok) {
            // show the invalid Bigfix-id message.
            this.setState({
                isFetched: true,
                isValidRequest: false
            });
        }

        const result = await response.json();
        const sortedResult = Object.keys(result)
            .sort()
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue] = result[currentValue];
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
            isValidRequest: true
        }));
    };
}
