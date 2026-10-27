import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  FormGroup,
  Input,
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
      e.preventDefault();
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
    <FormGroup className='space-y-2'>
      <Label for='userSearch' className='block text-sm font-semibold'>Search For User Using Kerberos or Email</Label>
      <div className='flex items-start gap-2'>
        <Input
          type='search'
          name='search'
          id='userSearch'
          placeholder='Search . . .'
          className={`input w-full ${isInvalid ? 'input-error' : ''}`}
          value={search}
          invalid={isInvalid}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? 'user-search-error' : undefined}
          onChange={e => setSearch(e.target.value)}
          onKeyPress={e => handleKeyPress(e)}
        />
        <Button color='outline' type='button' onClick={loadUser} disabled={loading || search.trim() === ''} aria-label='Search users'>
          {loading ? (
            <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />
          ) : (
            <MagnifyingGlassIcon data-icon="magnifying-glass" className='hero-icon size-4' />
          )}
        </Button>
      </div>
      {isInvalid && <p id='user-search-error' className='m-0 text-sm text-error' role='status'>No user found. Check the Kerberos ID or email and try again.</p>}
    </FormGroup>
  );
};

export default SearchUsers;
