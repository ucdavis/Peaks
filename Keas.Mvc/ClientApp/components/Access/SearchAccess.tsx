import * as React from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../Types';

interface IProps {
  selectedAccess?: IAccess;
  onSelect: (access: IAccess) => void;
  onDeselect: () => void;
}

interface IState {
  isSearchLoading: boolean;
  accesses: IAccess[];
}

// Search for existing access then send selection back to parent
export default class SearchAccess extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      accesses: [],
      isSearchLoading: false
    };
  }

  public render() {
    return this._renderSelectAccess();
  }

  private _renderSelectAccess = () => {
    return (
      <div>
        <label>Pick an access to assign</label>
        <div>
          <AsyncTypeahead
            id='searchAccesses' // for accessibility
            isLoading={this.state.isSearchLoading}
            minLength={3}
            placeholder='Search for access by name or by serial number'
            labelKey='name'
            filterBy={() => true} // don't filter on top of our search
            allowNew={false}
            renderMenuItemChildren={(option, props, index) => (
              <div>
                <div>
                  <Highlighter key='name' search={props.text}>
                    {option.name}
                  </Highlighter>
                </div>
                <div>
                  <small>
                    Some other search term:
                    <Highlighter key='id' search={props.text}>
                      text
                    </Highlighter>
                  </small>
                </div>
              </div>
            )}
            onSearch={this._onSearch}
            onChange={selected => {
              if (selected && selected.length === 1) {
                this._onSelected(selected[0]);
              }
            }}
            options={this.state.accesses}
          />
        </div>
        <div>or</div>
        <div>
          <Button
            color='link'
            onClick={() => {
              this._createNew();
            }}
          >
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Access
          </Button>
        </div>
      </div>
    );
  };

  private _onSearch = async (query: string) => {
    this.setState({ isSearchLoading: true });
    let accesses: IAccess[] = null;
    try {
      accesses = await this.context.fetch(
        `/api/${this.context.team.slug}/access/search?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching accesses.');
      this.setState({ isSearchLoading: false });
      return;
    }
    this.setState({
      accesses,
      isSearchLoading: false
    });
  };

  private _onSelected = (access: IAccess) => {
    // onChange is called when deselected
    if (!access || !access.name) {
      this.props.onDeselect();
    } else {
      this.props.onSelect({
        ...access
      });
    }
  };

  private _createNew = () => {
    this.props.onSelect({
      assignments: [],
      id: 0,
      name: '',
      notes: '',
      tags: '',
      teamId: 0
    });
  };
}
