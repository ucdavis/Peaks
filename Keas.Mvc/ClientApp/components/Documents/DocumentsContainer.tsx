import * as React from 'react';
import { IPerson } from '../../models/People';
import { PermissionsUtil } from '../../util/permissions';
import { Context } from '../../Context';
import { AppContext } from '../../models/Shared';
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { IDocument, IDocumentTemplate } from '../../models/Document';
import { DocumentsList } from './DocumentsList';
import { Button } from 'reactstrap';
import { AssignDocument } from './AssignDocument';
import { toast } from 'react-toastify';
import Denied from '../Shared/Denied';

interface IProps {
  person: IPerson;
}

export const DocumentsContainer = (props: IProps): JSX.Element => {
  const ctx = useContext<AppContext>(Context);

  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assign, setAssign] = useState<boolean>(false);

  const canView = useMemo(() => {
    // TODO: once testing is done, turn on access for all teams 
    return (
      ctx.team.slug === 'caes-cru' &&
      PermissionsUtil.canViewDocuments(ctx.permissions)
    );
    // return PermissionsUtil.canViewDocuments(ctx.permissions);
  }, [ctx]);

  useEffect(() => {
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

  const sendDocument = useCallback(
    async (template: IDocumentTemplate) => {
      // make the new document we want to create
      const newDocument: Partial<IDocument> = {
        person: props.person,
        personId: props.person.id,
        team: ctx.team,
        teamId: ctx.team.id,
        name: template.name,
        templateId: template.templateId,
        status: 'sent'
      };

      try {
        const result: IDocument = await ctx.fetch(
          `/api/${ctx.team.slug}/documents/create`,
          {
            body: JSON.stringify(newDocument),
            method: 'POST'
          }
        );

        // add newly created document to the list
        setDocuments([result, ...documents]);
        setAssign(false); // close the assign modal
        toast.success('Document successfully sent for signing!');
      } catch (e) {
        toast.error('Error sending document');
        throw new Error(); // throw error so modal doesn't close
      }
    },
    [ctx, documents, props.person]
  );

  if (!canView) {
    return <Denied viewName='Documents' />;
  }

  if (loading) {
    return <div>Loading Documents...</div>;
  }

  return (
    <div className='card spaces-color'>
      <div className='card-header-spaces'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-briefcase fa-xs' /> Documents
          </h2>
          <Button color='link' onClick={() => setAssign(true)}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Document
          </Button>
        </div>
      </div>
      <div className='card-content'>
        <DocumentsList
          documents={documents}
          downloadUrl={`/api/${ctx.team.slug}/documents/get`}
        ></DocumentsList>

        <AssignDocument
          person={props.person}
          sendDocument={sendDocument}
          show={assign}
          setShow={setAssign}
        ></AssignDocument>
      </div>
    </div>
  );
};
