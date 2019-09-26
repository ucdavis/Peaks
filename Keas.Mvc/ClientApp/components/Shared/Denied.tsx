import * as React from 'react';

interface IProps {
  viewName: string;
}

export default class Denied extends React.Component<IProps, {}> {
  public render() {
    return (
      <div className='card'>
        <div className='card-body'>
          <h4 className='card-title'>{this.props.viewName}</h4>
          <div>You do not have permission to see {this.props.viewName}.</div>
        </div>
      </div>
    );
  }
}
