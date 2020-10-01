import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IHistory } from '../../models/Shared';
import HistoryList from './HistoryList';

interface IProps {
  controller: string;
  id: number;
}

const HistoryContainer = (props: IProps) => {
  const [histories, setHistories] = useState<IHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reloaded, setReloaded] = useState<boolean>(false);
  const [reloading, setReloading] = useState<boolean>(false);
  const context = useContext(Context);

  const reloadHistories = async () => {
    setReloading(true);
    setReloaded(false);
    const histories = await getHistories();
    setHistories(histories);
    setReloading(false);
    setReloaded(true);
  };

  const getHistories = async () => {
    const historyFetchUrl = `/api/${context.team.slug}/${props.controller}/getHistory/${props.id}`;

    const histories = await context.fetch(historyFetchUrl);
    return histories;
  };
  
  useEffect(() => {
    const retrieveHistories = async () => {
      const historyData = await getHistories();
      setHistories(historyData);
      setLoading(false);
    };
    setLoading(true);
    retrieveHistories();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className='card history-color'>
      <div>
        <div className='card-head'>
          <h2>
            <i className='fas fa-history fa-xs' /> History
          </h2>
        </div>
      </div>
      <div className='card-content'>
        {histories.length > 0 && <HistoryList histories={histories} />}
        {histories.length < 1 && <p>No histories were found</p>}
        {props.controller === 'people' && (
          <Button color='link' onClick={reloadHistories} disabled={reloading}>
            Refresh {reloaded ? <i className='fas fa-check' /> : null}
            {reloading ? <i className='fas fa-spin fa-spinner' /> : null}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HistoryContainer;
