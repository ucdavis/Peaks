import * as React from "react";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

interface IProps {
    onRevoke: (asset: any) => void;
    asset: any;
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
        this.props.onRevoke(this.props.asset);
    }

    public render() {
        const hasAssignment = !!this.props.asset.assignment;
        return (
            <ButtonDropdown isOpen={this.state.isOpen} toggle={this.toggle} dropup>
                <DropdownToggle size="sm" color="info">
                    <i className="fa fa-ellipsis-h fa-lg" aria-hidden="true"></i>
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={this._revoke} disabled={!hasAssignment} > Revoke</DropdownItem>
                    <DropdownItem>Another Action</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}