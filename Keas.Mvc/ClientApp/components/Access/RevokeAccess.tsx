import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";

import * as moment from "moment";
import DatePicker from "react-datepicker";
import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";
import AssignPerson from "../People/AssignPerson";
import AccessEditValues from "./AccessEditValues";
import SearchAccess from "./SearchAccess";

import 'react-datepicker/dist/react-datepicker.css';

interface IProps {
    closeModal: () => void;
    modal: boolean;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
    person?: IPerson;
    selectedAccess: IAccess;
}

interface IState {
    access: IAccess;
    error: string;
    person: IPerson;
    validState: boolean;
}

export default class RevokeAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            access: this.props.selectedAccess,
            error: "",
            person: null,
            validState: false,
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
                <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
                    <ModalHeader>Revoke Access</ModalHeader>
                    <ModalBody>
                        <div className="container-fluid">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="assignto">Revoke From</label>
                                    <AssignPerson
                                        person={this.props.person || this.state.person}
                                        onSelect={this._onSelectPerson} />
                                </div>

                                <div className="form-group">
                                    <label>Pick an access to revoke</label>
                                    <SearchAccess
                                        allowNew={false}
                                        selectedAccess={this.state.access}
                                        onSelect={this._onSelected}
                                        onDeselect={this._onDeselected} />
                                </div>
                                {!!this.props.selectedAccess &&
                                    <AccessEditValues
                                        selectedAccess={this.props.selectedAccess}
                                        disableEditing={true} />}

                                {this.state.error}
                            </form>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this._revokeSelected} disabled={!this.state.validState}>
                             Revoke
                        </Button>
                        {" "}
                        <Button color="secondary" onClick={this._closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
        );
    }

    // clear everything out on close
    private _closeModal = () => {
        this.setState({
            access: null,
            error: "",
            person: null,
            validState: false,
        });
        this.props.closeModal();
    };

    private _revokeSelected = async () => {
        if (!this.state.validState) {
            return;
        }
        const person = this.props.person ? this.props.person : this.state.person;
        const accessAssignment = this.state.access.assignments.filter(x => x.personId === person.id);

        await this.props.onRevoke(accessAssignment[0]);

        this._closeModal();
    };

    // once we have either selected or created the access we care about
    private _onSelected = (access: IAccess) => {
        // if this access is not already assigned

        // TODO: more validation of name
        if (access.name.length > 64) {
            this.setState({
                access: null,
                error: "The access name you have chosen is too long"
            },
                this._validateState);
        }
        // else if (this.props.assignedAccessList.findIndex(x => x == access.name) != -1)
        // {
        //    this.setState({ selectedAccess: null, error: "The access you have chosen is already assigned to this user", validAccess: false }, this._validateState);
        // }
        else {
            this.setState({
                access,
                error: ""
            }, this._validateState);
        }
    };

    private _onDeselected = () => {
        this.setState({
            access: null,
            error: ""
        }, this._validateState);
    }

    private _onSelectPerson = (person: IPerson) => {
        this.setState({ person }, this._validateState);
    };


    private _validateState = () => {
        let valid = true;
        if (!this.state.access) {
            valid = false;
        } else if ((!this.state.person && !this.props.person) ||
            !this._checkValidRevokeFromPerson()) {
            valid = false;
        } else if (this.state.error !== "") {
            valid = false;
        }
        this.setState({ validState: valid });

    }

    private _checkValidRevokeFromPerson = () => {
        let valid = false;
        const assignments = this.state.access.assignments;
        for (const a of assignments) {
            if (a.personId === this.state.person.id) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            this.setState({ error: "The user you have selected is not assigned this access." });
        }
        else {
            this.setState({ error: "" });
        }
        return valid;
    }
    
}
