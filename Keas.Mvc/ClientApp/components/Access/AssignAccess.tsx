import PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ListGroup, ListGroupItem } from "reactstrap";

import { AppContext, IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
    onAssign: (access: IAccess) => void;
    onCreate: (access: IAccess) => any;
}

interface IState {
    accessList: IAccess[];
    newAccessName: string;
    modal: boolean;
    loading: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
    };
    public context: AppContext;

    constructor(props) {
        super(props);
        this.state = {
            accessList: [],
            newAccessName: "",
            modal: false,
            loading: true,
        };
    }

    public toggle = () => {
        this.setState({
            modal: !this.state.modal,
        });
    }

    public openModal = async () => {
        this.setState({ modal: true });
        const accessList: IAccess[] = await this.context.fetch(
            `/access/listteamaccess?teamId=${this.context.person.teamId}`,
        );
        this.setState({ accessList, loading: false });
    }

    public createAccess = async () => {
        var newAccess = await this.props.onCreate({
            id: 0,
            name: this.state.newAccessName,
            teamId: this.context.person.teamId,
        });
        // TODO: check for success

        this.setState({
            modal: false,
            accessList: [...this.state.accessList, newAccess],
            });
    }

    public assignAccess = async (access: IAccess) => {
        //TODO: avoid assigning something already assigned
        await this.props.onAssign(access);
        this.setState({ modal: false });
    }

    private _onChange = (e) => {
        this.setState({newAccessName: e.target.value});
    }

    public render() {
        const assets = this.state.accessList.map((x) => <AssignAccessList key={x.id.toString()} onAssign={this.assignAccess} access={x} />);
        return (
            <div>
                <Button color="danger" onClick={this.openModal}>
                    Add Access
                </Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader>Assign Access</ModalHeader>
                    <ModalBody>
                        {this.state.loading && 
                            <h2>Loading...</h2>}
                        {!this.state.loading &&
                            <ul className="list-group">
                                {assets}
                                <li className="list-group-item">
                                    <input type="text" className="form-control" placeholder="Create new asset" value={this.state.newAccessName} onChange={this._onChange} ></input>
                                </li>
                            </ul>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.createAccess}>
                            Add & Assign New Access
                        </Button>{" "}
                        <Button color="secondary" onClick={this.toggle}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
