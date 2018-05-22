import * as React from "react";

import KeyListItem from "./KeyListItem";

import { IKey } from "../../Types";

interface IProps {
    keys: IKey[];
    onRevoke: (key: IKey) => void;
    onAdd: (key: IKey) => void;
    showDetails: (key: IKey) => void;
    onEdit: (key: IKey) => void;
}

export default class KeyList extends React.Component<IProps, {}> {
    public render() {
        const key = this.props.keys.map(x => (
            <KeyListItem
                key={x.id.toString()}
                keyEntity={x}
                onRevoke={this.props.onRevoke}
                onAdd={this.props.onAdd}
                showDetails={this.props.showDetails}
                onEdit={this.props.onEdit}
            />
        ));
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Serial</th>
                        <th>Number</th>
                        <th>Assigned To</th>
                        <th>Expiration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{key}</tbody>
            </table>
        );
    }
}
