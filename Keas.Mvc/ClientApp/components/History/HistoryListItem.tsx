import * as React from 'react';
import { IHistory } from '../../models/Shared';
import { DateUtil } from '../../util/dates';

interface IProps {
    history: IHistory;
    showLink?: boolean;
}

const HistoryListItem = (props: IProps) => {
  return (
    <tr>
      <td>{DateUtil.formatExpiration(props.history.actedDate)}</td>
          <td>{props.history.description}</td>
          {props.showLink && (
          <td>                  <a
              href={`/notify-test${props.history.link}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
              >...</a></td>
          )}
    </tr>
  );
};


export default HistoryListItem;
