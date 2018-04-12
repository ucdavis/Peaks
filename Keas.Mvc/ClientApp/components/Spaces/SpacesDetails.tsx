import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ListGroup,
    ListGroupItem
} from "reactstrap";
import { ISpace, AppContext } from "ClientApp/Types";


interface IProps {
    closeModal: () => void;
    modal: boolean;
    selectedSpace: ISpace;
}

interface IState {
    details: any[];
}

    export default class SpacesDetails extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            details: []
        };
    }

    public async componentWillReceiveProps(nextProps) {
        console.log("will1");
        if (!!nextProps.selectedSpace && this.props.selectedSpace.roomKey !== nextProps.selectedSpace.roomKey)
        {
            console.log("will2");
            const details = await this.context.fetch(`/spaces/getSpaceDetails?id=${nextProps.selectedSpace.roomKey}`);
            this.setState({ details });
        }
    }

    public render() {
        if (this.props.selectedSpace == null)
        {
            return null;
        }
        const space = this.props.selectedSpace;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg">
                    <ModalHeader>Details for {space.room.roomNumber} {space.room.bldgName}</ModalHeader>
                    <ModalBody>
                        {space.room.roomName &&
                            <div className="form-group">
                                <label>Room Name</label><br />
                                {space.room.roomName}
                            </div>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
