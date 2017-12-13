import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
    accessList: IAccess[];
    onAssign: (access: IAccess) => void;
    onCreate: (access: IAccess) => void;
}

interface IState {
    modal: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
        };
    }

    public toggle = () => {
        this.setState({
            modal: !this.state.modal,
        });
    }

    public createAccess = async () => {
        await this.props.onCreate({
            id: 0,
            name: "newaccess" + new Date().getUTCSeconds(),
            teamId: 1,
        });
        // TODO: check for success
        this.setState({ modal: false });
    }

    public assignAccess = async (access: IAccess) => {
        //TODO: avoid assigning something already assigned
        await this.props.onAssign(access);
        this.setState({ modal: false });
    }

    public render() {
        const assets = this.props.accessList.map((x) => <AssignAccessList key={x.id.toString()} onAssign={this.assignAccess} access={x} />);
        return (
            <div>
                <Button color="danger" onClick={this.toggle}>
                    Add Access
                </Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader>Assign Access</ModalHeader>
                    <ModalBody>
                        <table>
                            <tbody>
                                {assets}
                            </tbody>
                        </table>
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
