import * as PropTypes from "prop-types";

import * as React from "react";

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
} from "reactstrap";
import { IBigFixSearchedName } from "../../Types";

interface IProps {
    addBigFixId: (property: string, id: string) => void;
}

interface IState {
    isFetched: boolean;
    isSearching: boolean;
    isValidSearch: boolean;
    searchModal: boolean;
    selectedFeild: string;
    valueToBeSearched: string;
    listOfComputers: IBigFixSearchedName[];
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
            isFetched: false,
            isSearching: false,
            isValidSearch: true,
            listOfComputers: [],
            searchModal: false,
            selectedFeild: "Name",
            valueToBeSearched: ""
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
            <a
                className="bigfix-info"
                onClick={() => {
                    this._modalToggle();
                }}
            >
                <i className="fas fa-info-circle ml-2" />
            </a>
        );
    };

    private _renderSearchModal = () => {
        return (
            <Modal
                isOpen={this.state.searchModal}
                toggle={this._modalToggle}
                size="lg"
                className="equipment-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>Search Computer Id</h2>
                    <Button color="link" onClick={this._modalToggle}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>

                <ModalBody className="d-flex justify-content-center">
                    {this._renderModalBody()}
                </ModalBody>
                <ModalFooter>{this._renderSearchButton()}</ModalFooter>
            </Modal>
        );
    };

    private _renderModalBody = () => {
        return (
            <Form className="w-75">
                <FormGroup className="mb-5">
                    <Label for="exampleSelect">Feild</Label>
                    <Input
                        type="select"
                        name="select"
                        id="exampleSelect"
                        onChange={e => this._changeSelectedInput(e.target.value)}
                        value={this.state.selectedFeild}
                    >
                        <option value="Name">Name</option>
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
        if (this.state.selectedFeild === "Name") {
            return (
                <>
                    <label>Name</label>
                    <Input
                        type="text"
                        name="name"
                        id="computer name"
                        placeholder="Enter Computer Name"
                        invalid={this.state.valueToBeSearched.length < 1}
                        onChange={e => {
                            this.setState({
                                valueToBeSearched: e.target.value
                            });
                        }}
                    />
                </>
            );
        } else if (this.state.selectedFeild === "Id") {
            return <Input type="text" name="Id" id="computer Id" placeholder="Enter Computer Id" />;
        } else if (this.state.selectedFeild === "Company") {
            return (
                <Input
                    type="text"
                    name="Company"
                    id="computer Company"
                    placeholder="Enter Computer Company"
                />
            );
        }
    };

    private _renderNameTable = () => {
        if (!this.state.isFetched) {
            return null;
        }

        if (!this.state.isValidSearch) {
            return (
                <p className="text-center text-danger">
                    No computer found by this name, please try again.
                </p>
            );
        }
        return (
            <Table>
                <tbody>
                    {this.state.listOfComputers.map(computer => {
                        return (
                            <tr
                                className="bigfix-info"
                                onClick={() =>
                                    this.props.addBigFixId("systemManagementId", computer.id)
                                }
                                key={computer.id}
                            >
                                <td>{computer.name}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    };

    private _renderSearchButton = () => {
        if (this.state.isSearching) {
            return (
                <Button color="primary" disabled={false}>
                    {" "}
                    <i className="fas fa-lg fa-spinner fa-pulse" />
                </Button>
            );
        } else {
            return (
                <Button
                    color="primary"
                    disabled={false}
                    onClick={() => {
                        this.setState({ isSearching: true, isFetched: false, isValidSearch: true });
                        this._getComputersBySearch(
                            this.state.selectedFeild,
                            this.state.valueToBeSearched
                        );
                    }}
                >
                    Search!
                </Button>
            );
        }
    };

    private _getComputersBySearch = async (field: string, value: string) => {
        const response = await fetch(
            `/api/${this.context.team.slug}/equipment/GetComputersBySearch?field=${field}&value=${value}`,
            {
                method: "GET"
            }
        );

        if (!response.ok) {
            // show the invalid name message.
            this.setState({ isValidSearch: false });
        }

        const result = await response.json();

        // if length is 0, not a valid search
        if (result.length === 0) {
            this.setState({
                isFetched: true,
                isSearching: false,
                isValidSearch: false
            });
        } else {

            // if more than five, shrink the array to only 5 names.
            if (result.length > 5) {
                const firstFiveNames = [];
                for (let index = 0; index < 5; index++) {
                    firstFiveNames.push(result[index]);
                }

                this.setState({
                    isFetched: true,
                    isSearching: false,
                    listOfComputers: firstFiveNames
                });
            } else {
                this.setState({
                    isFetched: true,
                    isSearching: false,
                    listOfComputers: result
                });
            }
        }
    };

    private _changeSelectedInput = value => {
        this.setState({
            isFetched: false,
            listOfComputers: [],
            selectedFeild: value
        });
    };

    private _modalToggle = () => {
        this.setState(prevState => ({
            isFetched: false,
            isValidSearch: true,
            listOfComputers: [],
            searchModal: !prevState.searchModal
        }));
    };
}
