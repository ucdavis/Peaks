import * as React from "react";
import Button from "reactstrap/lib/Button";
import { IEquipment } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    selectedEquipment: IEquipment;
    openUpdateModal: (equipment: IEquipment) => void;
}

export default class EquipmentAssignmentValues extends React.Component<IProps, {}> {
    public render() {
        return (
            <div>
                <Button
                    color="link"
                    onClick={() => this.props.openUpdateModal(this.props.selectedEquipment)}
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
                            value={this.props.selectedEquipment.assignment.person.name}
                        />
                    </div>
                    <div className="form-group">
                        <label>Expires at</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={DateUtil.formatExpiration(
                                this.props.selectedEquipment.assignment.expiresAt
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
