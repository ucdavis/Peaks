import * as React from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

interface IProps {
    onRevoke?: () => void;
    canRevoke?: boolean;

    onAdd?: () => void;
    canAdd?: boolean;

    showDetails?: () => void;
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

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    public render() {
        return (
            <Dropdown direction="up" isOpen={this.state.isOpen} toggle={this.toggle}>
                <DropdownToggle size="sm" color="info">
                    <i className="fa fa-ellipsis-h fa-lg" aria-hidden="true"></i>
                </DropdownToggle>
                <DropdownMenu>
                    {this.props.canRevoke &&
                        <DropdownItem onClick={this.props.onRevoke} > Revoke</DropdownItem>
                    }
                    {this.props.canAdd &&
                        <DropdownItem onClick={this.props.onAdd} >Assign</DropdownItem>}
                    {this.props.showDetails != null &&
                        <DropdownItem onClick={this.props.showDetails} > Show Details</DropdownItem>}
                </DropdownMenu>
            </Dropdown>
        );
    }
}