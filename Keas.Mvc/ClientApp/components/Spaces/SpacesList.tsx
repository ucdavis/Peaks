import * as React from "react";

import SpacesListItem from "./SpacesListItem";

import { ISpace, IKey, IKeyInfo } from "../../Types";

interface IProps {
    selectedKeyInfo?: IKeyInfo;
    spaces: ISpace[];
    onDisassociate?: (space: ISpace, keyInfo: IKeyInfo) => void;
    showDetails?: (space: ISpace) => void;
    // onAdd?: (space: ISpace) => void;
}

export default class SpacesList extends React.Component<IProps, {}> {
    public render() {
        const { spaces } = this.props;

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>Room Name</th>
                        <th className="list-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>{ spaces.map(this.renderItem) }</tbody>
            </table>
        );
    }

    private renderItem = (space: ISpace) => {
        const { selectedKeyInfo } = this.props;
        
        return (
            <SpacesListItem
                key={space.id}
                space={space}
                onDisassociate={!!selectedKeyInfo
                    ? (s) => this.props.onDisassociate(s, selectedKeyInfo)
                    : null}
                showDetails={this.props.showDetails}
            />
        );
    }
}
