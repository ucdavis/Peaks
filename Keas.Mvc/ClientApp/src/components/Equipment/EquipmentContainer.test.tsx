import * as React from 'react';
import { render, cleanup, act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router';
import { Context } from '../../Context';
import { IEquipment } from '../../models/Equipment';
import { ISpace } from '../../models/Spaces';
import { fakeEquipment } from '../specs/mockData/Equipment';
import { routes } from '../../pages/assets/routes';
import EquipmentContainer from '../Equipment/EquipmentContainer';

let container: HTMLElement = null;

vi.mock('../History/HistoryContainer', () => ({
  default: () => <div id='HistoryContainer'>HistoryContainer</div>
}));

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('Equipment duplication', () => {
  beforeEach(() => {
    // The date picker measures text with canvas, which jsdom does not implement.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  const setup = async (
    options: {
      view?: 'team' | 'person' | 'space';
      action?: string;
      permissions?: string[];
      missing?: boolean;
    } = {}
  ) => {
    const source: IEquipment = {
      ...fakeEquipment[0],
      type: 'Laptop',
      protectionLevel: 'P2',
      availabilityLevel: 'A2',
      systemManagementId: 'original-id',
      tags: 'Research',
      attributes: fakeEquipment[0].attributes.map(attribute => ({ ...attribute })),
      space: {
        id: 31,
        roomNumber: '101',
        bldgName: 'Research Hall',
        active: true
      } as ISpace
    };
    const sourceSnapshot = JSON.stringify(source);
    const person = source.assignment.person;
    const otherPerson = fakeEquipment[1].assignment.person;
    let saved: IEquipment;
    const duplicate = vi.fn(async (draft: IEquipment) => ({
      ...draft,
      id: 901,
      attributes: draft.attributes.map((attribute, index) => ({
        ...attribute,
        id: 990 + index,
        equipmentId: 901
      }))
    }));
    const assign = vi.fn(async (url: string) => ({
      ...saved,
      assignment: {
        id: 902,
        equipmentId: saved.id,
        equipment: null,
        expiresAt: new Date('2030-01-01'),
        person: url.includes(`personId=${person.id}&`) ? person : otherPerson
      }
    }));
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/equipment/duplicate')) {
        saved = await duplicate(JSON.parse(init.body as string));
        return saved;
      }
      if (url.includes('/equipment/assign?')) return assign(url);
      if (url.includes('/people/searchPeople?')) return [otherPerson];
      if (url.includes('/equipment/details/')) return source;
      if (url.includes('/equipment/commonAttributeKeys/')) return ['wallKey'];
      if (url.includes('/equipment/ListEquipmentTypes/')) return ['Default', 'Laptop'];
      if (url.includes('/spaces/shortlist')) return [source.space];
      if (url.includes('/equipment/list') || url.includes('/equipment/getEquipmentInSpace')) {
        return options.missing ? [] : [source];
      }
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    const assetTotalUpdated = vi.fn();
    const assetInUseUpdated = vi.fn();
    const base = options.view === 'person'
      ? `/team/people/details/${person.id}`
      : options.view === 'space' ? `/team/spaces/details/${source.space.id}` : '/team';
    const path = options.view === 'person' || options.view === 'space'
      ? '/:team/:section/details/:containerId/:assetType/:action?/:id?'
      : '/:team/equipment/:action?/:id?';

    await act(async () => {
      render(
        <Context.Provider value={{ fetch, permissions: options.permissions || ['EquipMaster'], team: { id: 1, name: 'Team', slug: 'team' }, tags: ['Research'] }}>
          <MemoryRouter initialEntries={[`${base}/equipment/${options.action || 'duplicate'}/${source.id}`]}>
            <Route path={path}>
              <EquipmentContainer
                person={options.view === 'person' ? person : undefined}
                space={options.view === 'space' ? source.space : undefined}
                assetTotalUpdated={assetTotalUpdated}
                assetInUseUpdated={assetInUseUpdated}
              />
            </Route>
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    return { source, sourceSnapshot, person, otherPerson, duplicate, assign, fetch, assetTotalUpdated, assetInUseUpdated };
  };

  const saveCopy = () => fireEvent.click(screen.getByRole('button', { name: 'Save as new equipment' }));
  const selectOtherPerson = async (name: string) => {
    fireEvent.change(screen.getByRole('combobox', { name: 'Search for person by name or email' }), { target: { value: name } });
    fireEvent.click(await screen.findByRole('option', { name: new RegExp(name) }));
  };

  it('opens from details, edits copied values, and saves a new unassigned identity without changing the source', async () => {
    const state = await setup({ action: 'details' });
    fireEvent.click(await screen.findByRole('button', { name: 'Duplicate Equipment' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Duplicate equipment')).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: state.source.name })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue(state.source.name);
    expect(screen.getByLabelText('Serial Number / Identifier')).toHaveValue('');
    expect(screen.getByLabelText('Make')).toHaveValue(state.source.make);
    expect(screen.getByLabelText('Model')).toHaveValue(state.source.model);
    expect(screen.getByLabelText('Attribute value 1')).toHaveValue('5');
    expect(screen.getByRole('combobox', { name: 'Search for person by name or email' })).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New laptop' } });
    fireEvent.change(screen.getByLabelText('Serial Number / Identifier'), { target: { value: 'NEW-SERIAL' } });
    fireEvent.change(screen.getByLabelText('Attribute value 1'), { target: { value: '6' } });
    saveCopy();

    await waitFor(() => expect(state.duplicate).toHaveBeenCalledTimes(1));
    const payload = state.duplicate.mock.calls[0][0];
    expect(payload).toMatchObject({ id: 0, teamId: 1, name: 'New laptop', serialNumber: 'NEW-SERIAL', systemManagementId: '', make: state.source.make, model: state.source.model, tags: 'Research', space: state.source.space, attributes: [{ id: 0, equipmentId: 0, key: 'wallKey', value: '6' }] });
    expect(payload.assignment).toBeUndefined();
    expect(payload.equipmentAssignmentId).toBeUndefined();
    expect(state.assign).not.toHaveBeenCalled();
    expect(JSON.stringify(state.source)).toBe(state.sourceSnapshot);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(container).getByText('New laptop')).toBeInTheDocument();
    expect(within(container).getByText(state.source.name)).toBeInTheDocument();
    expect(state.assetTotalUpdated).toHaveBeenCalledWith('equipment', 31, null, 1);
  });

  it('keeps copied fields editable after creation fails and can retry the same draft', async () => {
    const state = await setup();
    state.duplicate.mockRejectedValueOnce(new Error('Save unavailable'));
    fireEvent.change(screen.getByLabelText('Serial Number / Identifier'), { target: { value: 'RETRY-SERIAL' } });
    saveCopy();

    expect(await screen.findByRole('alert')).toHaveTextContent('Your changes are still here');
    expect(screen.getByLabelText('Serial Number / Identifier')).toHaveValue('RETRY-SERIAL');
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('readonly');
    expect(state.assetTotalUpdated).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Retried copy' } });
    saveCopy();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(state.duplicate).toHaveBeenCalledTimes(2);
    expect(state.duplicate.mock.calls[1][0]).toMatchObject({ id: 0, name: 'Retried copy', serialNumber: 'RETRY-SERIAL' });
    expect(state.assetTotalUpdated).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(state.source)).toBe(state.sourceSnapshot);
  });

  it('prevents Enter in a pending person search from submitting a new equipment record', async () => {
    const state = await setup();
    const personSearch = screen.getByRole('combobox', { name: 'Search for person by name or email' });
    fireEvent.change(personSearch, { target: { value: 'Searching' } });
    expect(fireEvent.keyDown(personSearch, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(state.duplicate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save as new equipment' })).toBeEnabled();
  });

  it('preserves the new record after assignment fails and retries assignment without creating another copy', async () => {
    const state = await setup();
    await selectOtherPerson(state.otherPerson.name);
    state.assign.mockRejectedValueOnce(new Error('Assignment unavailable'));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Saved copy' } });
    saveCopy();

    expect(await screen.findByRole('alert')).toHaveTextContent('new equipment has been saved');
    expect(state.duplicate).toHaveBeenCalledTimes(1);
    expect(state.assign).toHaveBeenCalledTimes(1);
    expect(state.assign.mock.calls[0][0]).toContain(`equipmentId=901&personId=${state.otherPerson.id}&`);
    expect(within(container).getByText('Saved copy')).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(state.assetTotalUpdated).toHaveBeenCalledTimes(1);
    expect(state.assetInUseUpdated).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save assignment' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(state.duplicate).toHaveBeenCalledTimes(1);
    expect(state.assign).toHaveBeenCalledTimes(2);
    expect(state.assetTotalUpdated).toHaveBeenCalledTimes(1);
    expect(state.assetInUseUpdated).toHaveBeenCalledExactlyOnceWith('equipment', 31, state.otherPerson.id, 1);
    expect(within(container).getAllByText('Saved copy')).toHaveLength(1);
  });

  it('allows changing the person from a person page without adding the copy to the original person', async () => {
    const state = await setup({ view: 'person' });
    expect(screen.getByRole('combobox', { name: 'Search for person by name or email' })).toHaveValue(`${state.person.name} (${state.person.email})`);
    await selectOtherPerson(state.otherPerson.name);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Other person copy' } });
    saveCopy();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(state.assign.mock.calls[0][0]).toContain(`personId=${state.otherPerson.id}&`);
    expect(within(container).queryByText('Other person copy')).not.toBeInTheDocument();
    expect(state.assetInUseUpdated).toHaveBeenCalledExactlyOnceWith('equipment', 31, state.otherPerson.id, 1);
    expect(state.assetTotalUpdated).toHaveBeenCalledExactlyOnceWith('equipment', 31, null, 1);
  });

  it('allows clearing the person and saves unassigned outside that person’s list', async () => {
    const state = await setup({ view: 'person' });
    fireEvent.change(screen.getByRole('combobox', { name: 'Search for person by name or email' }), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Unassigned copy' } });
    saveCopy();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(state.assign).not.toHaveBeenCalled();
    expect(state.assetInUseUpdated).not.toHaveBeenCalled();
    expect(within(container).queryByText('Unassigned copy')).not.toBeInTheDocument();
  });

  it('excludes a copy from the space page when its room is cleared', async () => {
    const state = await setup({ view: 'space' });
    const spaceInput = screen.getByRole('combobox', { name: 'Search for space' });
    fireEvent.click(within(spaceInput.parentElement).getByRole('button', { name: 'Clear selection' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Roomless copy' } });
    saveCopy();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(state.duplicate.mock.calls[0][0].space).toBeNull();
    expect(within(container).queryByText('Roomless copy')).not.toBeInTheDocument();
    expect(state.assetTotalUpdated).toHaveBeenCalledExactlyOnceWith('equipment', null, null, 1);
  });

  it('denies duplication to users without equipment permissions', async () => {
    const state = await setup({ permissions: ['KeyMaster'] });
    expect(screen.getByText('You do not have permission to see Equipment.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(state.fetch).not.toHaveBeenCalled();
  });

  it('does not open an empty duplication dialog when the source is missing', async () => {
    await setup({ missing: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save as new equipment' })).not.toBeInTheDocument();
  });
});

afterEach(() => {
  // cleanup on exiting
  cleanup();
  container.remove();
  container = null;
});

describe('Equipment Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeEquipment)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe(' Serial NumberNameAssigned ToExpirationActions');
  });

  it('Shows Add Button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeEquipment)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = container.querySelector('.card-header-equipment')
      .textContent;
    expect(headerRecord).toContain('Add Equipment');
  });

  it('Shows equipment list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeEquipment)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const matches = container.querySelectorAll('.asset-table tbody tr');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('Dell Desktop')) {
        foundIt = true;
        expect(rowContent).toContain('Yeager, Eren'); // confirm assigned person is displayed
        expect(rowContent).toContain('4DVNPD2'); // confirm serial number are displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of equipment', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeEquipment)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });
    const matches = container.querySelectorAll('.asset-table tbody tr');

    expect(matches.length).toBe(4); //Should this be 3? Or is the inactive ignored and only used when queried by the api?
  });

  it('Shows equipment details', async () => {
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeEquipment)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter initialEntries={['/caes-cru/equipment/details/24']}>
            {routes}
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const detailButton = container.querySelectorAll('button')[1];
    detailButton.click();

    const details = document.querySelector('.modal-content').textContent;

    expect(details).toContain('Dell Desktop'); // confirm name is displayed
    expect(details).toContain('Monitor'); // confirm notes is displayed
  });
});
