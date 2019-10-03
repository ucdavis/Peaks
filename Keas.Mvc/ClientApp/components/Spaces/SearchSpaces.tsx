import * as React from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { ISpace } from '../../Types';

interface IProps {
  onSelect: (space: ISpace) => void;
  defaultSpace?: ISpace;
  isRequired?: boolean;
}

interface IState {
  isSearchLoading: boolean;
  spaces: ISpace[];
}

// TODO: need a way to clear out selected space
// Assign a space via search lookup, unless a space is already provided
export default class SearchSpaces extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isSearchLoading: false,
      spaces: []
    };
  }

  public render() {
    const { defaultSpace } = this.props;

    return (
      <AsyncTypeahead
        id='searchSpaces' // for accessibility
        isInvalid={this.props.isRequired && !this.props.defaultSpace}
        clearButton={true}
        isLoading={this.state.isSearchLoading}
        minLength={2}
        placeholder='Search for space'
        defaultSelected={defaultSpace ? [defaultSpace] : []}
        labelKey={(option: ISpace) => `${option.roomNumber} ${option.bldgName}`}
        filterBy={() => true}
        renderMenuItemChildren={this.renderItem}
        onSearch={this.onSearch}
        onChange={this.onChange}
        options={this.state.spaces}
      />
    );
  }

  private renderItem = (option, props, index) => {
    return (
      <div>
        <div>
          {!!option.roomNumber && (
            <Highlighter key='roomNumber' search={props.text}>
              {option.roomNumber}
            </Highlighter>
          )}{' '}
          {!!option.bldgName && (
            <Highlighter key='bldgName' search={props.text}>
              {option.bldgName}
            </Highlighter>
          )}
        </div>
        {!!option.roomName && (
          <div>
            <small>
              <Highlighter key='roomName' search={props.text}>
                {option.roomName}
              </Highlighter>
            </small>
          </div>
        )}
      </div>
    );
  };

  private onSearch = async query => {
    this.setState({ isSearchLoading: true });
    let spaces: ISpace[] = null;
    try {
      spaces = await this.context.fetch(
        `/api/${this.context.team.slug}/spaces/searchSpaces?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching spaces.');
      this.setState({ isSearchLoading: false });
      return;
    }
    this.setState({
      isSearchLoading: false,
      spaces
    });
  };

  private onChange = selected => {
    if (selected && selected.length === 1) {
      this.props.onSelect(selected[0]);
      return;
    }

    this.props.onSelect(null);
  };
}
