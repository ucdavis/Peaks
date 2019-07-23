import * as moment from "moment";
import * as PropTypes from "prop-types";
import * as React from "react";
import DatePicker from "react-datepicker";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IPerson, ISpace, IWorkstation } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import SearchWorkstations from "./SearchWorkstations";
import WorkstationEditValues from "./WorkstationEditValues";

import "react-datepicker/dist/react-datepicker.css";

interface IProps {
    onCreate: (person: IPerson, workstation: IWorkstation, date: any) => void;
    modal: boolean;
    onAddNew: () => void;
    closeModal: () => void;
    openDetailsModal: (workstation: IWorkstation) => void;
    openEditModal: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
    person?: IPerson;
    space?: ISpace;
    tags: string[];
}

interface IState {
    date: any;
    workstation: IWorkstation;
    error: string;
    person: IPerson;
    submitting: boolean;
    validState: boolean;
}

export default class AssignWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            date:
                !!this.props.selectedWorkstation && !!this.props.selectedWorkstation.assignment
                    ? moment(this.props.selectedWorkstation.assignment.expiresAt)
                    : moment()
                          .add(3, "y")
                          .startOf("day"),
            error: "",
            person:
                !!this.props.selectedWorkstation && !!this.props.selectedWorkstation.assignment
                    ? this.props.selectedWorkstation.assignment.person
                    : this.props.person,
            submitting: false,
            validState: false,
            workstation: this.props.selectedWorkstation
        };
    }

    // make sure we change the workstation we are updating if the parent changes selected workstation
    public componentWillReceiveProps(nextProps) {
        if (nextProps.selectedWorkstation !== this.props.selectedWorkstation) {
            this.setState({ workstation: nextProps.selectedWorkstation });
        }

        if (nextProps.person !== this.state.person) {
            this.setState({ person: nextProps.person });
        } else if (!!nextProps.selectedWorkstation && !!nextProps.selectedWorkstation.assignment) {
            this.setState({
                date: moment(nextProps.selectedWorkstation.assignment.expiresAt),
                person: nextProps.selectedWorkstation.assignment.person
            });
        }
    }

    public render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this._confirmClose}
                    size="lg"
                    className="spaces-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>{this.props.selectedWorkstation || this.props.person ? "Assign Workstation" : "Add Workstation"}</h2>
                        <Button color="link" onClick={this._closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>

                    <ModalBody>
                        <div className="container-fluid">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="assignto">Assign To</label>
                                    <AssignPerson
                                        disabled={
                                            !!this.props.person ||
                                            (!!this.props.selectedWorkstation &&
                                                !!this.props.selectedWorkstation.assignment)
                                        } // disable if we are on person page or updating
                                        person={this.props.person || this.state.person}
                                        onSelect={this._onSelectPerson}
                                        isRequired={
                                            this.state.workstation &&
                                            this.state.workstation.teamId !== 0
                                        }
                                    />
                                </div>
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
                                {!this.state.workstation && (
                                    <div className="form-group">
                                        <SearchWorkstations
                                            selectedWorkstation={this.state.workstation}
                                            onSelect={this._onSelected}
                                            onDeselect={this._onDeselected}
                                            space={this.props.space}
                                            openDetailsModal={this.props.openDetailsModal}
                                        />
                                    </div>
                                )}
                                {this.state.workstation &&
                                !this.state.workstation.teamId && ( // if we are creating a new workstation, edit properties
                                        <div>
                                            <div className="row justify-content-between">
                                                <h3>Create New Workstation</h3>
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
                                            <WorkstationEditValues
                                                tags={this.props.tags}
                                                selectedWorkstation={this.state.workstation}
                                                changeProperty={this._changeProperty}
                                                disableEditing={false}
                                                disableSpaceEditing={false}
                                            />
                                        </div>
                                    )}
                                {!!this.state.workstation && !!this.state.workstation.teamId && (
                                    <div>
                                        <div className="row justify-content-between">
                                            <h3>Assign Existing Workstation</h3>
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
                                        <WorkstationEditValues
                                            selectedWorkstation={this.state.workstation}
                                            disableEditing={true}
                                            openEditModal={this.props.openEditModal}
                                            disableSpaceEditing={true}
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
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                workstation: {
                    ...this.state.workstation,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _confirmClose = () => {
        if (!confirm("Please confirm you want to close!")){
            return;
        }

        this._closeModal();
    }

    private _closeModal = () => {
        this.setState({
            date: moment()
                .add(3, "y")
                .startOf("day"),
            error: "",
            person: null,
            submitting: false,
            validState: false,
            workstation: null
        });
        this.props.closeModal();
    };

    // assign the selected workstation even if we have to create it
    private _assignSelected = async () => {
        if (!this.state.validState || this.state.submitting) {
            return;
        }

        this.setState({ submitting: true });
        const person = this.props.person ? this.props.person : this.state.person;
        const workstation = this.state.workstation;

        await this.props.onCreate(person, workstation, this.state.date.format());

        this._closeModal();
    };

    // once we have either selected or created the workstation we care about
    private _onSelected = (workstation: IWorkstation) => {
        // if this workstation is not already assigned

        // TODO: more validation of name
        if (workstation.name.length > 64) {
            this.setState(
                {
                    error: "The workstation name you have chosen is too long",
                    workstation: null
                },
                this._validateState
            );
        } else {
            this.setState({ workstation, error: "" }, this._validateState);
        }
    };

    private _onDeselected = () => {
        this.setState({ workstation: null, error: "" }, this._validateState);
    };

    private _onSelectPerson = (person: IPerson) => {
        this.setState({ person }, this._validateState);
    };

    private _validateState = () => {
        let valid = true;
        if (
            !this.state.workstation ||
            !this.state.workstation.space ||
            !this.state.workstation.name
        ) {
            valid = false;
        } else if (this.state.error !== "") {
            valid = false;
        } else if (!this.state.date) {
            valid = false;
        } else if (moment().isSameOrAfter(this.state.date)) {
            valid = false;
        }
        this.setState({ validState: valid });
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
            this.setState({ date: null, error: "Please enter a valid date" }, this._validateState);
        }
    };
}
