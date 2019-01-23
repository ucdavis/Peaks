import * as React from "react";
import Button from "reactstrap/lib/Button";
import { IWorkstation } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    selectedWorkstation: IWorkstation;
    openUpdateModal: (workstation: IWorkstation) => void;
}

export default class WorkstationAssignmentValues extends React.Component<IProps, {}> {
    public render() {
        return (
            <div>
                <Button
                    color="link"
                    onClick={() => this.props.openUpdateModal(this.props.selectedWorkstation)}
                >
                    <i className="fas fa-edit fa-xs" /> Update Assignment
                </Button>

                <div className="wrapperasset">
                    <div className="form-group">
                        <label>Assigned To</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedWorkstation.assignment.person.name}
                        />
                    </div>
                    <div className="form-group">
                        <label>Expires at</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={DateUtil.formatExpiration(
                                this.props.selectedWorkstation.assignment.expiresAt
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
