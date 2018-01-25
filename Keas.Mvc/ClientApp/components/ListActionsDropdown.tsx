import * as React from "react";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

interface IProps {
    onRevoke?: () => void;
    canRevoke?: boolean;
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

    private _revoke = () => {
        this.props.onRevoke();
    }

    public render() {
        return (
            <ButtonDropdown isOpen={this.state.isOpen} toggle={this.toggle} dropup>
                <DropdownToggle size="sm" color="info">
                    <i className="fa fa-ellipsis-h fa-lg" aria-hidden="true"></i>
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={this._revoke} disabled={!this.props.canRevoke} > Revoke</DropdownItem>
                    <DropdownItem>Another Action</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}