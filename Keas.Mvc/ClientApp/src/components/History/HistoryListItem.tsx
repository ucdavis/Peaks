import * as React from 'react';
import { IHistory } from '../../models/Shared';
import { DateUtil } from '../../util/dates';
import { useContext } from 'react';
import { Context } from '../../Context';

interface IProps {
  history: IHistory;
  showLink?: boolean;
}

const HistoryListItem = (props: IProps) => {
  const context = useContext(Context);
  return (
    <tr>
      <td>{DateUtil.formatDate(props.history.actedDate, true)}</td>
      <td>{props.history.description}</td>
      <td>
        {props.showLink && props.history.link != null && (
          <a
            href={`/${context.team.slug}${props.history.link}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            ...
          </a>
        )}
      </td>
    </tr>
  );
};

export default HistoryListItem;
