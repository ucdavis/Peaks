import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import {
    Button,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, ISpace } from "../../Types";
import EquipmentContainer from "../Equipment/EquipmentContainer";
import KeyContainer from "../Keys/KeyContainer";
import WorkstationContainer from "../Workstations/WorkstationContainer";
import SpaceDetailContainer from "./SpaceDetailContainer";

interface IProps {
    closeModal: () => void;
    selectedSpace: ISpace;
    inUseUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    totalUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    edited: (type: string, spaceId: number, personId: number) => void;
    tags: string[];
}

export default class SpacesDetails extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedSpace)
        {
            return null;
        }
        return (
            <div>
                <div>
                    <Button color="link" onClick={this.props.closeModal}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
                <br />
                <div>
                    {this.props.selectedSpace &&
                    <SpaceDetailContainer space={this.props.selectedSpace}/>}
                    <KeyContainer space={this.props.selectedSpace}
                        assetInUseUpdated={this.props.inUseUpdated}
                        assetTotalUpdated={this.props.totalUpdated}
                        assetEdited={this.props.edited}
                        />
                    <EquipmentContainer space={this.props.selectedSpace}
                        assetInUseUpdated={this.props.inUseUpdated}
                        assetTotalUpdated={this.props.totalUpdated}
                        assetEdited={this.props.edited}/>
                    <WorkstationContainer 
                        space={this.props.selectedSpace} 
                        tags={this.props.tags}
                        assetInUseUpdated={this.props.inUseUpdated}
                        assetTotalUpdated={this.props.totalUpdated}
                        assetEdited={this.props.edited}/>
                </div>
            </div>
        );
    }


}
