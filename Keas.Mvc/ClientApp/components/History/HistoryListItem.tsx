import * as React from "react";
import { IHistory } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    history: IHistory;
}

export default class HistoryListItem extends React.Component<IProps, {}> {
    public render() {
        return (
            <tr>
                <td>{DateUtil.formatExpiration(this.props.history.actedDate)}</td>
                <td>{this.props.history.description}</td>
            </tr>
        );
    }
}
