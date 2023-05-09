import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  Label
} from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';

interface IProps {
  updatePerson: (person: IPerson) => void;
}

const SearchUsers = (props: IProps) => {
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const context = useContext(Context);

  const handleKeyPress = e => {
    if (e.which === 13) {
      loadUser();
    }
  };

  const loadUser = async () => {
    if (loading || search === '') {
      return;
    }
    setLoading(true);
    const userFetchUrl = `/api/${context.team.slug}/people/searchUsers?searchTerm=${search}`;

    let person = null;
    try {
      person = await context.fetch(userFetchUrl);
    } catch (err) {
      if (err.message === 'Not Found') {
        // on 404
        person = null;
      } else {
        // on some other error
        toast.error('Error searching users.');
        setLoading(false);
        return;
      }
    }
    props.updatePerson(person);
    setLoading(false);
    setIsInvalid(!person);
  };

  return (
    <FormGroup>
      <Label for='search'>Search For User Using Kerberos or Email</Label>
      <InputGroup>
        <Input
          type='search'
          name='search'
          id='userSearch'
          placeholder='Search . . .'
          className='form-control'
          value={search}
          invalid={isInvalid}
          onChange={e => setSearch(e.target.value)}
          onKeyPress={e => handleKeyPress(e)}
        />
        <Button color='link' onClick={loadUser}>
          {loading ? (
            <i className='fas fa-spin fa-spinner' />
          ) : (
            <i className='fas fa-search fa-sm' />
          )}
        </Button>
      </InputGroup>
    </FormGroup>
  );
};

export default SearchUsers;
