import * as React from 'react';
import { IDocument } from '../../models/Document';

interface IProps {
  documents: IDocument[];
  downloadUrl: string;
}

export const DocumentsList = (props: IProps): JSX.Element => {
  return (
    <div className='table'>
      <table className='table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {props.documents.map(doc => (
            <tr key={doc.id}>
              <td>{doc.name}</td>
              <td>{doc.status}</td>
              <td><a href={`${props.downloadUrl}/${doc.id}`}>Download</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
