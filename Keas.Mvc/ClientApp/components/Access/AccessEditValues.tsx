import * as React from "react";
import ReactTable from "react-table";
import { Button, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { IAccess, IAccessAssignment } from "../../Types";
import { DateUtil } from "../../util/dates";
import SearchTags from "../Tags/SearchTags";

interface IProps {
    selectedAccess: IAccess;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
    openEditModal?: (access: IAccess) => void;
    tags?: string[];
}

export default class AccessEditValues extends React.Component<IProps, {}> {
    public render() {
        const columns = [
            {
                Header: "First Name",
                accessor: x => x.person.firstName,
                id: "personFirstName"
            },
            {
                Header: "Last Name",
                accessor: x => x.person.lastName,
                id: "personLastName"
            },
            {
                Header: "Expires at",
                accessor: x => DateUtil.formatExpiration(x.expiresAt),
                id: "expiresAt"
            },
            {
                Cell: row => (
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        disabled={this.props.disableEditing || !this.props.onRevoke}
                        onClick={() => this._revokeSelected(row.original.person.id)}
                    >
                        <i className="fas fa-trash" />
                    </button>
                ),
                Header: "Revoke",
                sortable: false
            }
        ];

        return (
            <div>
                {this.props.disableEditing && this.props.openEditModal && (
                    <Button
                        color="link"
                        onClick={() => this.props.openEditModal(this.props.selectedAccess)}
                    >
                        <i className="fas fa-edit fa-xs" /> Edit Access
                    </Button>
                )}
            <div className="wrapperasset">
                <FormGroup>
                    <Label for="item">Item</Label>
                    <Input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedAccess && this.props.selectedAccess.name
                                ? this.props.selectedAccess.name
                                : ""
                        }
                        onChange={e => this.props.changeProperty("name", e.target.value)}
                        invalid={!this.props.selectedAccess.name}
                    />
                    <FormFeedback>Item name is required</FormFeedback>
                </FormGroup>
                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedAccess.notes ? this.props.selectedAccess.notes : ""
                        }
                        onChange={e => this.props.changeProperty("notes", e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags
                        tags={this.props.tags}
                        disabled={this.props.disableEditing}
                        selected={
                            !!this.props.selectedAccess && !!this.props.selectedAccess.tags
                                ? this.props.selectedAccess.tags.split(",")
                                : []
                        }
                        onSelect={e => this.props.changeProperty("tags", e.join(","))}
                    />
                </div>
                {this.props.selectedAccess.teamId !== 0 &&
                    this.props.selectedAccess.assignments.length > 0 && (
                        <div>
                            <h3>Assigned to:</h3>
                            <ReactTable
                                data={this.props.selectedAccess.assignments}
                                columns={columns}
                                minRows={1}
                            />
                        </div>
                    )}
            </div>
          </div>
        );
    }

    private _revokeSelected = async (personId: number) => {
        const accessAssignment = this.props.selectedAccess.assignments.filter(
            x => x.personId === personId
        );
        await this.props.onRevoke(accessAssignment[0]);
    };
}
