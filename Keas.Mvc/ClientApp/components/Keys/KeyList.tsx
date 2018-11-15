import * as React from "react";

import KeyListItem from "./KeyListItem";

import { IKey } from "../../Types";

interface IProps {
    keys: IKey[];
    onDisassociate?: (key: IKey) => void;
    onAdd?: (key: IKey) => void;
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
}

export default class KeyList extends React.Component<IProps, {}> {
    public render() {
        const { keys } = this.props;

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th className="">Available Serials</th>
                        <th className="list-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>{keys.map(this.renderItem)}</tbody>
            </table>
        );
    }

    private renderItem = (key) => {
        return (
            <KeyListItem
                key={key.id}
                keyEntity={key}
                onDisassociate={this.props.onDisassociate}
                onAdd={this.props.onAdd}
                showDetails={this.props.showDetails}
                onEdit={this.props.onEdit}
            />
        );
    }
}
