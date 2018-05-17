import * as moment from "moment";
import * as React from "react";

import { IHistory } from "../../Types";

interface IProps {
    history: IHistory;
}


export default class HistoryListItem extends React.Component<IProps, {}> {
    public render() {
        return (
          <tr>
            <td>{moment(this.props.history.actedDate).format("MM-DD-YYYY")}</td>
            <td>{this.props.history.description}</td>
          </tr>
        );
      }
}
