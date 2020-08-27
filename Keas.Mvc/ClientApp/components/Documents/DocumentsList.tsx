import * as React from 'react';
import { IDocument } from '../../models/Document';
import { DateUtil } from '../../util/dates';

interface IProps {
  documents: IDocument[];
  downloadUrl: string;
}

export const DocumentsList = (props: IProps): JSX.Element => {
  if (props.documents.length === 0) {
    return <div>No Documents Found</div>;
  }
  
  return (
    <div className='table'>
      <table className='table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {props.documents.map(doc => (
            <tr key={doc.id}>
              <td>{doc.name}</td>
              <td>{doc.status}</td>
              <td>{doc.status === 'completed' ? DateUtil.formatDate(doc.completedAt) : DateUtil.formatDate(doc.createdAt)}</td>
              <td><a href={`${props.downloadUrl}/${doc.id}`}>Download</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
