import * as React from "react";

import SpacesListItem from "./SpacesListItem";

import { ISpace, ISpaceInfo } from "../../Types";

interface IProps {
    spaces: ISpaceInfo[];
    showDetails: (space: ISpace) => void;
}

export default class SpacesList extends React.Component<IProps, {}> {
    public render() {
        const space = this.props.spaces.map(x => (
            <SpacesListItem
                key={x.space.roomKey}
                spaceInfo={x}
                showDetails={this.props.showDetails}
            />
        ));
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Room</th>
                        <th>Name</th>
                        <th>Key Count</th>
                        <th>Equipment Count</th>
                        <th>Total Workstations</th>
                        <th>Available Workstations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{space}</tbody>
            </table>
        );
    }
}
