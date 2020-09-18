import * as React from 'react';
import { IHistory } from '../../models/Shared';
import { DateUtil } from '../../util/dates';

interface IProps {
  history: IHistory;
}

const HistoryListItem = (props: IProps) => {
  return (
    <tr>
      <td>{DateUtil.formatExpiration(props.history.actedDate)}</td>
      <td>{props.history.description}</td>
    </tr>
  );
};


export default HistoryListItem;
