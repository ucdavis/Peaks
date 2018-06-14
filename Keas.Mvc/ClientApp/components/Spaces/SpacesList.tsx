import * as React from "react";

import SpacesListItem from "./SpacesListItem";

import { ISpace, ISpaceInfo } from "../../Types";

interface IProps {
    spaces: ISpaceInfo[];
    showDetails: (space: ISpace) => void;
}

export default class SpacesList extends React.Component<IProps, {}> {
    public render() {
        let space = null;
        if(!!this.props.spaces && this.props.spaces.length > 0)
        {
            space = this.props.spaces.map(x => (
                <SpacesListItem
                    key={x.space.roomKey}
                    spaceInfo={x}
                    showDetails={this.props.showDetails}
                />
            ));
        }
        else
        {
            space = (<tr><td colSpan="8">No Spaces Were Found</td></tr>)
        }

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Room</th>
                        <th>Name</th>
                        <th>Keys</th>
                        <th>Equipment</th>
                        <th>Workstations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{space}</tbody>
            </table>
        );
    }
}
