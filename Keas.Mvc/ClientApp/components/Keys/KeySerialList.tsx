import * as React from "react";

import KeySerialListItem from "./KeySerialListItem";

import { IKeySerial } from "../../Types";

interface IProps {
    keySerials: IKeySerial[];
    onAssign?: (keySerial: IKeySerial) => void;
    onRevoke?: (keySerial: IKeySerial) => void;
    onUpdate?: (keySerial: IKeySerial) => void;
    showDetails?: (keySerial: IKeySerial) => void;
    onEdit?: (keySerial: IKeySerial) => void;
}

export default class KeyList extends React.Component<IProps, {}> {
    public render() {
        const { keySerials } = this.props;

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Serial</th>
                        <th>Assigned To</th>
                        <th>Expiration</th>
                        <th className="list-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>{keySerials.map(this.renderItem)}</tbody>
            </table>
        );
    }

    private renderItem = (key) => {
        return (
            <KeySerialListItem
                key={key.id}
                keySerial={key}
                onRevoke={this.props.onRevoke}
                onAssign={this.props.onAssign}
                onUpdate={this.props.onUpdate}
                showDetails={this.props.showDetails}
                onEdit={this.props.onEdit}
            />
        );
    }
}
