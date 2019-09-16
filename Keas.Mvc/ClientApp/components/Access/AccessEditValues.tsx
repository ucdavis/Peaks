import * as React from "react";
import ReactTable from "react-table";
import { Button, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { IAccess, IAccessAssignment } from "../../Types";
import { DateUtil } from "../../util/dates";
import { ReactTableExpirationUtil } from "../../util/reactTable";
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
                Header: "Name",
                accessor: "person.name",
                filterMethod: (filter, row) =>
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
                filterable: true
            },
            {
                Cell: row => <span>{row.value ? DateUtil.formatExpiration(row.value) : ""}</span>,
                Filter: ({ filter, onChange }) => ReactTableExpirationUtil.filter(filter, onChange),
                Header: "Expiration",
                accessor: "expiresAt",
                filterMethod: (filter, row) => ReactTableExpirationUtil.filterMethod(filter, row),
                filterable: true,
                sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a, b)
            },
            {
                Cell: row => (
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        disabled={this.props.disableEditing || !this.props.onRevoke}
                        onClick={() => this._revokeSelected(row.value)}
                    >
                        <i className="fas fa-trash" />
                    </button>
                ),
                Header: "Revoke",
                accessor: "personId",
                className: "table-actions",
                filterable: false,
                headerClassName: "table-actions",
                resizable: false,
                sortable: false
            }
        ];

        return (
            <div>
                {this.props.disableEditing && this.props.openEditModal && (
                    <div className="row justify-content-between">
                        <h3>Access Details</h3>
                        <Button
                            color="link"
                            onClick={() => this.props.openEditModal(this.props.selectedAccess)}
                        >
                            <i className="fas fa-edit fa-xs" /> Edit Access
                        </Button>
                    </div>
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
                            value={this.props.selectedAccess.notes || ""}
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
        try {
            await this.props.onRevoke(accessAssignment[0]);
        } catch (err) {
            // TODO: add submitting state and handle
            return;
        }
    };
}
