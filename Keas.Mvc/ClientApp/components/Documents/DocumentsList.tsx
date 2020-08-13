import * as React from 'react';
import { IDocument } from '../../models/Document';

interface IProps {
  documents: IDocument[];
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
              <td>link to doc</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
