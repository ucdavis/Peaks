import * as React from 'react';
import { IHistory } from '../../models/Shared';
import HistoryListItem from './HistoryListItem';

interface IProps {
  histories: IHistory[];
}

const HistoryList = (props: IProps) => {
  const histories = props.histories.map(x => (
    <HistoryListItem key={x.id} history={x} />
  ));
  return (
    <div className='table'>
      <table className='table'>
        <thead>
          <tr />
        </thead>
        <tbody>{histories}</tbody>
      </table>
    </div>
  );
};

export default HistoryList;
