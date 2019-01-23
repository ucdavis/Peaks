import * as React from "react";
import { IKeySerial } from "../../Types";
import KeySerialListItem from "./KeySerialListItem";

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
        const serials = !keySerials || keySerials.length < 1 ?
            <tr><td colSpan={6}>No Key Serials Found</td></tr> :
            keySerials.map(this.renderItem);

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th/>
                        <th>Code</th>
                        <th>SN</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Expiration</th>
                        <th className="list-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>{serials}</tbody>
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
