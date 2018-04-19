import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ListGroup,
    ListGroupItem,
} from "reactstrap";
import { NavLink, Redirect } from "react-router-dom";
import { IEquipment, ISpace, AppContext } from "ClientApp/Types";


interface IProps {
    closeModal: () => void;
    modal: boolean;
    selectedSpace: ISpace;
}

interface IState {
    details: IEquipment[];
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
            details: [],
        };
    }

    public async componentWillReceiveProps(nextProps) {
        if (nextProps.selectedSpace !== this.props.selectedSpace)
        {
            const details = !nextProps.selectedSpace ? null :
                await this.context.fetch(`/spaces/getSpaceDetails?roomKey=${nextProps.selectedSpace.roomKey}`);
            this.setState({ details });
        }
    }

    public render() {
        if (!this.props.selectedSpace)
        {
            return null;
        }
        const detailsList = !!this.state.details ? this.state.details.map(x => (
            <NavLink key={x.id} to={`../../equipment/details/${x.id}`} >
                {x.name}
            </NavLink>
        )) : null;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this._closeModal} size="lg">
                    <ModalHeader>Details for {this.props.selectedSpace.room.roomNumber} {this.props.selectedSpace.room.bldgName}</ModalHeader>
                    <ModalBody>
                        {this.props.selectedSpace.room.roomName &&
                            <div className="form-group">
                            <label>Room Name</label><br />
                            {this.props.selectedSpace.room.roomName}
                            </div>}
                            <div className="form-group">
                                <label>Equipment</label><br />
                                {detailsList}
                            </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this._closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _closeModal = () => {
        this.setState({
            details: null,
        });
        this.props.closeModal();
    }

    private _equipDetails = (id: number) => {
        this.context.router.history.push(
            `${this.context.team.name}/equipment/details/${id}`
        );
    }
}
