import * as React from 'react';
import { IPerson } from '../../models/People';
import { PermissionsUtil } from '../../util/permissions';
import { Context } from '../../Context';
import { AppContext } from '../../models/Shared';
import { useContext, useEffect, useState, useMemo } from 'react';
import { IDocument } from '../../models/Document';
import { DocumentsList } from './DocumentsList';
import { Button } from 'reactstrap';

interface IProps {
  person: IPerson;
}

export const DocumentsContainer = (props: IProps): JSX.Element => {
  const ctx = useContext<AppContext>(Context);

  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const canView = useMemo(() => {
    // TODO: replace with document permissions
    return PermissionsUtil.canViewWorkstations(ctx.permissions);
  }, [ctx.permissions]);

  useEffect(() => {
    console.log('fetching documents for ', props.person);

    const loadDocuments = async () => {
      const result = await ctx.fetch(
        `/api/${ctx.team.slug}/documents/find/${props.person.id}`
      );

      setDocuments(result as IDocument[]);
      setLoading(false);
    };

    if (canView) {
      loadDocuments();
    }
  }, [canView, ctx, props.person]);

  if (!canView) {
    return;
  }

  if (loading) {
    return <span>loading...</span>;
  }

  return (
    <div className='card spaces-color'>
      <div className='card-header-spaces'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-briefcase fa-xs' /> Documents
          </h2>
          <Button color='link' onClick={() => this._openCreateModal()}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add
            Document
          </Button>
        </div>
      </div>
      <div className='card-content'>
        <DocumentsList documents={documents}></DocumentsList>
      </div>
    </div>
  );
};
