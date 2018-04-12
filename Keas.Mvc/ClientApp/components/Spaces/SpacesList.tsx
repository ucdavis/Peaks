import * as React from "react";

import SpacesListItem from "./SpacesListItem";

import { ISpace } from "../../Types";

interface IProps {
    spaces: ISpace[];
}

export default class KeyList extends React.Component<IProps, {}> {
    public render() {
        const space = this.props.spaces.map(x => (
            <SpacesListItem
                key={x.roomKey.toString()}
                space={x}
            />
        ));
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Room</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{space}</tbody>
            </table>
        );
    }
}
