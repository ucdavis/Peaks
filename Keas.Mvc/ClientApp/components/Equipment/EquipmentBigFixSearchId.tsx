import * as PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    Table,
    
   
} from "reactstrap";

interface IState {
    searchModal: boolean;
    selectedInput: string;
    valueToBeSearched: string;
}

export default class EquipmentBigFixInfo extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        permissions: PropTypes.array,
        router: PropTypes.object,
        team: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            searchModal: false,
            selectedInput: "Name",
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
                <ModalFooter>
                    <Button color="primary" disabled={false} onClick={() => {
                        alert(this.state.valueToBeSearched)
                    }}>
                        Search!
                    </Button>{" "}
                </ModalFooter>
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
                        value={this.state.selectedInput}
                    >
                        <option value="Name">Name</option>
                        <option value="Id">Id</option>
                        <option value="Company">Company</option>
                    </Input>
                </FormGroup>

                <FormGroup>{this.renderInputSearch()}</FormGroup>
            </Form>
        );
    };

    private renderInputSearch = () => {
        if (this.state.selectedInput === "Name") {
            return (
                <>
                    <label>Name</label>
                    <Input
                        type="text"
                        name="name"
                        id="computer name"
                        placeholder="Enter Computer Name"
                        onChange={e => {
                            this.setState({
                                valueToBeSearched: e.target.value
                            })
                        }}
                    />
                </>
            );
        } else if (this.state.selectedInput === "Id") {
            return <Input type="text" name="Id" id="computer Id" placeholder="Enter Computer Id" />;
        } else if (this.state.selectedInput === "Company") {
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

    // private _getBigFixComputerInfo = async (id: string) => {
    //     const response = await fetch(`/api/${this.context.team.slug}/equipment/GetComputer/${id}`, {
    //         method: "GET"
    //     });

    //     if (!response.ok) {
    //         // show the invalid Bigfix-id message.
    //         this.setState({
    //             isFetched: true,
    //             isValidRequest: false
    //         });
    //     }

    //     const result = await response.json();
    //     const sortedResult = Object.keys(result)
    //         .sort()
    //         .reduce((accumulator, currentValue) => {
    //             accumulator[currentValue] = result[currentValue];
    //             return accumulator;
    //         }, {});

    //     this.setState({
    //         computerInfo: sortedResult,
    //         isFetched: true
    //     });
    // };

    private _changeSelectedInput = value => {
        this.setState({
            selectedInput: value
        });
    };

    private _modalToggle = () => {
        this.setState(prevState => ({
            searchModal: !prevState.searchModal
        }));
    };
}
