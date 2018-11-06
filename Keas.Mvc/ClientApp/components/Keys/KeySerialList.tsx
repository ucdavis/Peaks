import * as React from "react";

import KeySerialListItem from "./KeySerialListItem";

import { IKeySerial } from "../../Types";

interface IProps {
    keySerials: IKeySerial[];
    onRevoke?: (keySerial: IKeySerial) => void;
    onAdd?: (keySerial: IKeySerial) => void;
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
                        <th>Available</th>
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
                onAdd={this.props.onAdd}
                showDetails={this.props.showDetails}
                onEdit={this.props.onEdit}
            />
        );
    }
}
