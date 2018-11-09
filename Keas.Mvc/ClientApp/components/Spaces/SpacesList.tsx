import * as React from "react";

import SpacesListItem from "./SpacesListItem";

import { ISpace, IKey } from "../../Types";

interface IProps {
    selectedKey?: IKey;
    spaces: ISpace[];
    onDisassociate?: (space: ISpace, key: IKey) => void;
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
        const { selectedKey } = this.props;
        
        return (
            <SpacesListItem
                key={space.id}
                space={space}
                onDisassociate={!!selectedKey
                    ? (s) => this.props.onDisassociate(s, selectedKey)
                    : null}
                showDetails={this.props.showDetails}
            />
        );
    }
}
