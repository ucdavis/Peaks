import * as React from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

interface IProps {
    onAdd?: () => void;
    onEdit?: () => void;
    onRevoke?: () => void;
    onUpdateAssignment?: () => void;
    showDetails?: () => void;
    onDelete?: () => void;
}

interface IState {
    isOpen: boolean;
}

export default class ListActionsDropdown extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    public render() {
        return (
            <Dropdown direction="left" isOpen={this.state.isOpen} toggle={this.toggle}>
                <DropdownToggle color="link">
                    <i className="fas fa-ellipsis-h fa-lg" aria-hidden="true" />
                </DropdownToggle>
                <DropdownMenu>
                    {!!this.props.onAdd &&
                        <DropdownItem onClick={this.props.onAdd} >Assign</DropdownItem>}
                    {!!this.props.onRevoke &&
                        <DropdownItem onClick={this.props.onRevoke} >Revoke</DropdownItem>}
                    {!!this.props.onEdit &&
                        <DropdownItem onClick={this.props.onEdit} >Edit</DropdownItem>}
                    {!!this.props.onUpdateAssignment &&
                        <DropdownItem onClick={this.props.onUpdateAssignment} >Update Assignment</DropdownItem>}
                    {!!this.props.showDetails &&
                        <DropdownItem onClick={this.props.showDetails} >Show Details</DropdownItem>}
                    {!!this.props.onDelete &&
                        <DropdownItem onClick={this.props.onDelete} >Delete</DropdownItem>}
                    </DropdownMenu>
            </Dropdown>
        );
    }
    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

}
