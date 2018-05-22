import PropTypes from "prop-types";
import * as React from "react";

import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { AppContext, IRoom } from "../../Types";

interface IProps {
    onSelect: (room: IRoom) => void;
    defaultRoom?: IRoom;
}

interface IState {
    isSearchLoading: boolean;
    rooms: IRoom[];
    selectedRoom: IRoom;
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
export default class AssignRoom extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isSearchLoading: false,
            rooms: [],
            selectedRoom: null,
        };
    }

    public render() {
        return (
            <div>
                <AsyncTypeahead
                    isLoading={this.state.isSearchLoading}
                    minLength={2}
                    placeholder="Search for room"
                    defaultInputValue={this.props.defaultRoom ?  
                        this.props.defaultRoom.roomNumber + " " + this.props.defaultRoom.bldgName : ""}
                    labelKey={(option: IRoom) =>
                        `${option.roomNumber} ${option.bldgName}`
                    }                    filterBy={() => true} 
                    renderMenuItemChildren={(option, props, index) => (
                        <div>
                            <div>
                                {!!option.roomNumber &&
                                    <Highlighter key="roomNumber" search={props.text}>
                                        {option.roomNumber}
                                    </Highlighter>}
                                {" "}
                                {!!option.bldgName &&
                                    <Highlighter key="bldgName" search={props.text}>
                                        {option.bldgName}
                                    </Highlighter>}
                            </div>
                            {!!option.roomName &&
                                <div>
                                    <small>
                                        <Highlighter key="roomName" search={props.text}>{option.roomName}</Highlighter>
                                    </small>
                                </div>}
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const rooms = await this.context.fetch(
                            `/api/${this.context.team.name}/spaces/searchRooms?q=${query}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            rooms
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this.setState({ selectedRoom: selected[0] });
                            this.props.onSelect(selected[0]);
                        }
                    }}
                    options={this.state.rooms}
                />
            </div>
        );
    };

}
