import * as React from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

interface IProps {
    actions: IAction[];
    className?: string; // for spaces/details/keys action buttons
}

interface IState {
    isOpen: boolean;
}

export interface IAction {
    title: string;
    onClick: () => void;
}

export default class ListActionsDropdown extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    public render() {
        const { actions } = this.props;

        return (
            <Dropdown direction="left" isOpen={this.state.isOpen} toggle={this.toggle}>
                <DropdownToggle color="link">
                    <i
                        className={`fas fa-ellipsis-h fa-lg ${this.props.className}`}
                        aria-hidden="true"
                    />
                </DropdownToggle>
                <DropdownMenu>{actions.map(this.renderAction)}</DropdownMenu>
            </Dropdown>
        );
    }

    private renderAction(action: IAction) {
        return (
            <DropdownItem key={action.title} onClick={action.onClick}>
                {action.title}
            </DropdownItem>
        );
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };
}
