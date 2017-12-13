import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { IAccess } from "../../Types";

interface IProps {
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

    public render() {
        return (
            <div>
                <Button color="danger" onClick={this.toggle}>
                    Add Access
                </Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader>Assign Access</ModalHeader>
                    <ModalBody>This will assign a new access</ModalBody>
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
