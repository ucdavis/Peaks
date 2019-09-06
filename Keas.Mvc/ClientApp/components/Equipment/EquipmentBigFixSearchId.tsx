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
    selectedFeild: string;
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
                <ModalFooter>
                    <Button color="primary" disabled={false} onClick={() => {
                        this._getComputersBySearch(this.state.selectedFeild, this.state.valueToBeSearched);
                    }}>
                        Search!
                    </Button>
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
                        value={this.state.selectedFeild}
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
        if (this.state.selectedFeild === "Name") {
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

    private _getComputersBySearch = async (field: string, value: string) => {
        const response = await fetch(`/api/${this.context.team.slug}/equipment/GetComputersBySearch?field=${field}&value=${value}`, {
            method: "GET"
        });

        if (!response.ok) {
            // show the invalid Bigfix-id message.
            
        }

        const result = await response.json();
        debugger;
    };

    private _changeSelectedInput = value => {
        this.setState({
            selectedFeild: value
        });
    };

    private _modalToggle = () => {
        this.setState(prevState => ({
            searchModal: !prevState.searchModal
        }));
    };
}
