import * as React from "react";
import { IKeySerial } from "../../Types";
import { DateUtil } from "../../util/dates";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";
import { Button } from "reactstrap";

interface IProps {
    keySerial: IKeySerial;
    onRevoke?: (key: IKeySerial) => void;
    onAssign?: (key: IKeySerial) => void;
    onUpdate?: (key: IKeySerial) => void;
    showDetails?: (key: IKeySerial) => void;
    onEdit?: (key: IKeySerial) => void;
}

export default class KeyListItem extends React.Component<IProps, {}> {
    public render() {
        const { keySerial } = this.props;

        const actions: IAction[] = [];
        if (!!this.props.onAssign && !keySerial.keySerialAssignment) {
            actions.push({
                onClick: () => this.props.onAssign(keySerial),
                title: "Assign",
            });
        }

        if (!!this.props.onRevoke && !!keySerial.keySerialAssignment) {
            actions.push({
                onClick: () => this.props.onRevoke(keySerial),
                title: "Revoke",
            });
        }

        return (
            <tr>
                <td>
                    <Button color="link" onClick={() => this.props.showDetails(this.props.keySerial)}>
                        Details
                    </Button>
                </td>
                <td>{keySerial.key.code}</td>
                <td>{keySerial.number}</td>
                <td>
                    <span className="text-mono">{keySerial.status}</span>
                </td>
                <td>
                    {keySerial.keySerialAssignment ? keySerial.keySerialAssignment.person.name : ""}
                </td>
                <td>
                    {keySerial.keySerialAssignment
                        ? DateUtil.formatExpiration(keySerial.keySerialAssignment.expiresAt)
                        : ""}
                </td>
                <td>
                    <ListActionsDropdown actions={actions} />
                </td>
            </tr>
        );
    }
}
