import * as moment from "moment";
import * as PropTypes from "prop-types";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IAccess, IPerson } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import AccessEditValues from "./AccessEditValues";
import SearchAccess from "./SearchAccess";

interface IProps {
    closeModal: () => void;
    modal: boolean;
    onCreate: (access: IAccess, date: any, person: IPerson) => void;
    onAddNew: () => void;
    openEditModal: (access: IAccess) => void;
    person?: IPerson;
    selectedAccess: IAccess;
    tags: string[];
}

interface IState {
    access: IAccess;
    date: any;
    error: string;
    person: IPerson;
    submitting: boolean;
    validState: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            access: this.props.selectedAccess,
            date: moment()
                .add(3, "y")
                .startOf("day"),
            error: "",
            person: null,
            submitting: false,
            validState: false
        };
    }

    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps) {
        if (nextProps.selectedAccess !== this.props.selectedAccess) {
            this.setState({ access: nextProps.selectedAccess });
        }

        if (nextProps.person !== this.props.person) {
            this.setState({ person: nextProps.person });
        }
    }

    public render() {
        return (
            <div>
                <Button color="link" onClick={this.props.onAddNew}>
                    <i className="fas fa-plus fa-sm" aria-hidden="true" /> Add Access
                </Button>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this._closeModal}
                    size="lg"
                    className="access-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>{this.props.selectedAccess || this.props.person ? "Assign Access" : "Add Access"}</h2>
                        <Button color="link" onClick={this._closeModalUsingIcon}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>
                    <ModalBody>
                        <div className="container-fluid">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="assignto">Assign To</label>
                                    <AssignPerson
                                        disabled={!!this.props.person}
                                        person={this.props.person || this.state.person}
                                        onSelect={this._onSelectPerson}
                                        isRequired={this.state.access && this.state.access.teamId !== 0}
                                    />
                                </div>
                                {!this.state.access && (
                                    <div className="form-group">
                                        <SearchAccess
                                            selectedAccess={this.state.access}
                                            onSelect={this._onSelected}
                                            onDeselect={this._onDeselected}
                                        />
                                    </div>
                                )}
                                {!!this.state.access &&
                                !this.state.access.teamId && ( // if we are creating a new access, edit properties
                                        <div>
                                            <div className="row justify-content-between">
                                                <h3>Create New Access</h3>
                                                <Button
                                                    className="btn btn-link"
                                                    onClick={this._onDeselected}
                                                >
                                                    Clear{" "}
                                                    <i
                                                        className="fas fa-times fa-sm"
                                                        aria-hidden="true"
                                                    />
                                                </Button>
                                            </div>
                                            <AccessEditValues
                                                selectedAccess={this.state.access}
                                                changeProperty={this._changeProperty}
                                                disableEditing={false}
                                                onRevoke={null}
                                                tags={this.props.tags}
                                            />
                                        </div>
                                    )}
                                {!!this.state.access && !!this.state.access.teamId && (
                                    <div>
                                        <div className="row justify-content-between">
                                            <h3>Assign Exisiting Access</h3>
                                            <Button
                                                className="btn btn-link"
                                                onClick={this._onDeselected}
                                            >
                                                Clear{" "}
                                                <i
                                                    className="fas fa-times fa-sm"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </div>
                                        <AccessEditValues
                                            selectedAccess={this.state.access}
                                            disableEditing={true}
                                            tags={this.props.tags}
                                            openEditModal={this.props.openEditModal}
                                            onRevoke={null}
                                        />
                                    </div>
                                )}

                                {(!!this.state.person || !!this.props.person) && (
                                    <div className="form-group">
                                        <label>Set the expiration date</label>
                                        <DatePicker
                                            selected={this.state.date}
                                            onChange={this._changeDate}
                                            onChangeRaw={this._changeDateRaw}
                                            className="form-control"
                                            showMonthDropdown={true}
                                            showYearDropdown={true}
                                            dropdownMode="select"
                                        />
                                    </div>
                                )}
                                {this.state.error}
                            </form>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={this._assignSelected}
                            disabled={!this.state.validState || this.state.submitting}
                        >
                            Go!{" "}
                            {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                access: {
                    ...this.state.access,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _closeModal = () => {
        if (!confirm("Please confirm you want to close!")){
            return;
        }
        this.setState({
            access: null,
            date: moment()
                .add(3, "y")
                .startOf("day"),
            error: "",
            person: null,
            submitting: false,
            validState: false
        });
        this.props.closeModal();
    };

    private _closeModalUsingIcon = () => {
        this.setState({
            access: null,
            date: moment()
                .add(3, "y")
                .startOf("day"),
            error: "",
            person: null,
            submitting: false,
            validState: false
        });
        this.props.closeModal();
    };


    // assign the selected access even if we have to create it
    private _assignSelected = async () => {
        if (!this.state.validState || this.state.submitting) {
            return;
        }

        this.setState({ submitting: true });
        const person = this.props.person ? this.props.person : this.state.person;

        await this.props.onCreate(this.state.access, this.state.date.format(), person);

        this._closeModal();
    };

    // once we have either selected or created the access we care about
    private _onSelected = (access: IAccess) => {
        // if this access is not already assigned

        // TODO: more validation of name
        if (access.name.length > 64) {
            this.setState(
                {
                    access: null,
                    error: "The access name you have chosen is too long"
                },
                this._validateState
            );
        } else {
            this.setState(
                {
                    access,
                    error: ""
                },
                this._validateState
            );
        }
    };

    private _onDeselected = () => {
        this.setState(
            {
                access: null,
                error: ""
            },
            this._validateState
        );
    };

    private _onSelectPerson = (person: IPerson) => {
        this.setState({ person }, this._validateState);
    };

    private _validateState = () => {
        let valid = true;
        if (!this.state.access || this.state.access.name === "") {
            valid = false;
        } else if (
            (!!this.state.person || !!this.props.person) &&
            !this._checkValidAssignmentToPerson()
        ) {
            valid = false;
        } else if (this.state.access.teamId !== 0 && !this.state.person && !this.props.person) {
            // if not a new access, require a person
            valid = false;
        } else if (this.state.error !== "") {
            valid = false;
        } else if (
            (!!this.state.person || !!this.props.person) &&
            (!this.state.date || moment().isSameOrAfter(this.state.date))
        ) {
            valid = false;
        }
        this.setState({ validState: valid });
    };

    private _checkValidAssignmentToPerson = () => {
        let valid = true;
        const person = this.props.person ? this.props.person : this.state.person;
        const assignments = this.state.access.assignments;
        for (const a of assignments) {
            if (a.personId === person.id) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            this.setState({ error: "The user you have selected is already assigned this access." });
        } else {
            this.setState({ error: "" });
        }
        return valid;
    };

    private _changeDate = newDate => {
        this.setState({ date: newDate.startOf("day"), error: "" }, this._validateState);
    };

    private _changeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const m = moment(value, "MM/DD/YYYY", true);
        if (m.isValid()) {
            this._changeDate(m);
        } else {
            this.setState({ date: null, error: "Please enter a valid date", validState: false });
        }
    };
}
