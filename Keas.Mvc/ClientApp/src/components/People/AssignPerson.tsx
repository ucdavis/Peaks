import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, FormGroup, Label } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { IValidationError } from '../../models/Shared';

interface IProps {
  onSelect: (person: IPerson) => void;
  person?: IPerson;
  label: string;
  disabled: boolean;
  isRequired: boolean;
  error?: IValidationError;
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
const AssignPerson = (props: IProps) => {
  const context = useContext(Context);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [people, setPeople] = useState<IPerson[]>([]);

  const renderFindPerson = () => {
    const isInvalid =
      (props.isRequired && !props.person) ||
      (props.error && props.error.path === 'person');
    // call onSelect when a user is found
    return (
      <div>
        <FormGroup>
          <Label for='searchPeople'>{props.label}</Label>
          <AsyncTypeahead
            id='searchPeople' // for accessibility
            inputProps={{
              className: isInvalid ? 'form-control is-invalid' : ''
            }}
            isInvalid={isInvalid}
            disabled={props.disabled}
            isLoading={isSearchLoading}
            minLength={3}
            defaultSelected={props.person ? [props.person] : []}
            placeholder='Search for person by name or email'
            labelKey={(option: IPerson) => `${option.name} (${option.email})`}
            filterBy={() => true} // don't filter on top of our search
            renderMenuItemChildren={(option, propsData, index) => (
              <div>
                <div>
                  <Highlighter key='name' search={propsData.text}>
                    {option.name}
                  </Highlighter>
                </div>
                <div>
                  <Highlighter key='email' search={propsData.text}>
                    {option.email}
                  </Highlighter>
                </div>
              </div>
            )}
            onSearch={onSearch}
            onChange={selected => {
              if (selected && selected.length === 1) {
                props.onSelect(selected[0]);
              }
              if (selected && selected.length === 0) {
                props.onSelect(null);
              }
            }}
            options={people}
          />
          {props.error && props.error.path === 'person' && (
            <div className='invalid-feedback d-block'>
              {props.error.message}
            </div>
          )}
        </FormGroup>
        <div>
          {props.disabled ? null : (
            <Link
              to={`/${context.team.slug}/people/create`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button color='link' type='button'>
                <i className='fas fa-search fas-sm' aria-hidden='true' /> Can't
                find who you're looking for?
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  };

  const onSearch = async (query: string) => {
    setIsSearchLoading(true);
    let newPeople: IPerson[] = null;
    try {
        newPeople = await context.fetch(
        `/api/${context.team.slug}/people/searchPeople?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching people.');
      setIsSearchLoading(false);
      return;
    }
    setPeople(newPeople);
    setIsSearchLoading(false);
  };
  return renderFindPerson();
};

export default AssignPerson;
