import * as React from "react";
import Button from "reactstrap/lib/Button";
import { IKeySerial } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    selectedKeySerial: IKeySerial;
    openUpdateModal: (keySerial: IKeySerial) => void;
}

export default class KeySerialAssignmentValues extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedKeySerial || !this.props.selectedKeySerial.keySerialAssignment) {
            return null;
        }
        return (
            <div>
              <div className="row justify-content-between mt-5">
                <h3>Assignment Details</h3>
                <Button
                    color="link"
                    onClick={() => this.props.openUpdateModal(this.props.selectedKeySerial)}
                >
                    <i className="fas fa-edit fa-xs" /> Update Assignment
                </Button>
</div>
                <div className="wrapperasset">
                    <div className="form-group">
                        <label>Assigned To</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedKeySerial.keySerialAssignment.person.name}
                        />
                    </div>
                    <div className="form-group">
                        <label>Expires at</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={DateUtil.formatExpiration(
                                this.props.selectedKeySerial.keySerialAssignment.expiresAt
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
