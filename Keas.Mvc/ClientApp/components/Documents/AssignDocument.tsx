import * as React from 'react';
import { ModalBody, Modal, Button } from 'reactstrap';
import { useEffect, useContext, useState } from 'react';
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
  const ctx = useContext<AppContext>(Context);

  const [templates, setTemplates] = useState<IDocumentTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTemplate, setSelectedTemplate] = useState<number>();

  // on load, get the list of templates we have available for this team
  useEffect(() => {
    const loadTemplates = async () => {
      const result: IDocumentTemplate[] = await ctx.fetch(
        `/api/${ctx.team.slug}/documents/TeamSettings`
      );

      if (result.length > 0) {
        setTemplates(result);
        setSelectedTemplate(result[0].id); // default select the first one
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
          No documents are available to send. Have a team administrator create
          documents by following the instructions on{' '}
          <a href='google.com'>our help page</a>
        </div>
      );
    }
    return (
      <div>
        <p>
          Send a document to {props.person.name} ({props.person.email})
        </p>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            try {
              await props.sendDocument(templates.find(t => t.id === selectedTemplate));
            } catch {
              // on error show the loaded ui so the user can try again
              setLoading(false);
            }
          }}
        >
          <div className='form-group'>
            <label>Select Template To Send</label>
            <select
              className='form-control'
              onChange={e => setSelectedTemplate(parseInt(e.target.value))}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <button type='submit' className='btn btn-primary'>
            Submit
          </button>
        </form>
      </div>
    );
  };

  return (
    <div>
      <Modal
        isOpen={show}
        toggle={() => setShow(false)}
        size='lg'
        className='spaces-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Assign Document for Signature</h2>
          <Button color='link' onClick={() => setShow(false)}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <div className='container-fluid'>
            {loading && <div>Loading</div>}
            {!loading && renderTemplates()}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
