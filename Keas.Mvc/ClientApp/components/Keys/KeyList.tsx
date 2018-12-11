import * as React from "react";

import KeyListItem from "./KeyListItem";

import { IKey, IKeyInfo } from "../../Types";

interface IProps {
    keysInfo: IKeyInfo[];
    onDisassociate?: (key: IKeyInfo) => void;
    onAdd?: (key: IKey) => void;
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
    onDelete?: (key: IKey) => void;
}

export default class KeyList extends React.Component<IProps, {}> {
    public render() {
        const { keysInfo } = this.props;

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
                <tbody>{keysInfo.map(this.renderItem)}</tbody>
            </table>
        );
    }

    private renderItem = (keyInfo) => {
        return (
            <KeyListItem
                key={keyInfo.id}
                keyInfo={keyInfo}
                onDisassociate={this.props.onDisassociate}
                onAdd={this.props.onAdd}
                onDelete={this.props.onDelete}
                showDetails={this.props.showDetails}
                onEdit={this.props.onEdit}
            />
        );
    }
}
