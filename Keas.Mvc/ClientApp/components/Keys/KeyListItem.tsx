import * as React from "react";
import { Button } from "reactstrap";
import { IKey, IKeyInfo } from "../../Types";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

interface IProps {
    keyInfo: IKeyInfo;
    onDisassociate?: (key: IKeyInfo) => void;
    onAdd?: (key: IKey) => void;
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
    onDelete?: (key: IKey) => void;
}

export default class KeyListItem extends React.Component<IProps, {}> {
    public render() {
        const { keyInfo } = this.props;

        const actions: IAction[] = [];
        if (!!this.props.onDisassociate) {
            actions.push({
                onClick: () => this.props.onDisassociate(keyInfo),
                title: "Disassociate"
            });
        }

        if (!!this.props.onDelete) {
            actions.push({ title: "Delete", onClick: () => this.props.onDelete(keyInfo.key) });
        }

        return (
            <tr>
                <td>
                    <Button
                        color="link"
                        onClick={() => this.props.showDetails(this.props.keyInfo.key)}
                    >
                        Details
                    </Button>
                </td>
                <td>{keyInfo.key.name}</td>
                <td>{keyInfo.key.code}</td>
                <td className="">
                    <i className="fas fa-key" /> {keyInfo.serialsInUseCount} /{" "}
                    {keyInfo.serialsTotalCount}
                </td>
                <td>
                    <ListActionsDropdown actions={actions} />
                </td>
            </tr>
        );
    }
}
