import { ModalBody, Modal, ModalFooter, ModalHeading } from '../Shared/AppModal';
import * as React from 'react';
import { useEffect, useContext, useState, useId } from 'react';
import { AppContext } from '../../models/Shared';
import { Context } from '../../Context';
import { IDocumentTemplate } from '../../models/Document';
import { IPerson } from '../../models/People';

interface IProps {
  show: boolean;
  setShow: (assign: boolean) => void;
  person: IPerson;
  sendDocument: (template: IDocumentTemplate) => Promise<void>;
}

export const AssignDocument = (props: IProps): JSX.Element => {
  const formId = useId();
  const ctx = useContext<AppContext>(Context);

  const [templates, setTemplates] = useState<IDocumentTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  // on load, get the list of templates we have available for this team
  useEffect(() => {
    const loadTemplates = async () => {
      const result: IDocumentTemplate[] = await ctx.fetch(
        `/api/${ctx.team.slug}/documents/TeamSettings`
      );

      if (result.length > 0) {
        setTemplates(result);
        setSelectedTemplate(result[0].templateId); // default select the first one
      }

      setLoading(false);
    };

    loadTemplates();
  }, [ctx]);

  const { show, setShow } = props;

  const renderTemplates = () => {
    if (templates.length === 0) {
      return (
        <div>
          No documents are available to send. Have a team administrator make
          sure they have selected a docusign account and that docusign
          template(s) have been shared with the PEAKS service account.
        </div>
      );
    }
    return (
      <div>
        <p>
          Send a document to {props.person.name} ({props.person.email})
        </p>
        <form
          id={formId}
          className='space-y-5'
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            try {
              await props.sendDocument(
                templates.find(t => t.templateId === selectedTemplate)
              );
              setLoading(false);
            } catch {
              // on error show the loaded ui so the user can try again
              setLoading(false);
            }
          }}
        >
          <div className='space-y-2'>
            <label htmlFor={`${formId}-template`} className='block text-sm font-semibold'>Template to send</label>
            <select
              id={`${formId}-template`}
              className='select w-full'
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
            >
              {templates.map(template => (
                <option key={template.templateId} value={template.templateId}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <Modal
        isOpen={show}
        toggle={() => setShow(false)}
        className='documents-color'
      >
        <ModalHeading>Assign Document for Signature</ModalHeading>

        <ModalBody>
          <div className='space-y-6'>
            {loading && <p role='status' className='text-base-content/70'>Processing...</p>}
            {!loading && renderTemplates()}
          </div>
        </ModalBody>
        <ModalFooter>
          {templates.length > 0 && <button type='submit' form={formId} className='btn btn-asset' disabled={loading}>Send document</button>}
        </ModalFooter>
      </Modal>
    </div>
  );
};
