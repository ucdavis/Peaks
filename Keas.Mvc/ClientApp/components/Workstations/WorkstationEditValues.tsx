import * as React from "react";
import { Button, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { ISpace, IWorkstation } from "../../Types";
import SearchSpaces from "../Spaces/SearchSpaces";
import SearchTags from "../Tags/SearchTags";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    openEditModal?: (workstation: IWorkstation) => void;
    tags?: string[];
    disableEditing: boolean;
    disableSpaceEditing: boolean;
    selectedWorkstation: IWorkstation;
    space?: ISpace;
}

export default class WorkstationEditValues extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedWorkstation) {
            return null;
        }
        return (
            <div>
                {this.props.disableEditing && this.props.openEditModal && (
                    <Button
                        color="link"
                        onClick={() => this.props.openEditModal(this.props.selectedWorkstation)}
                    >
                        <i className="fas fa-edit fa-xs" /> Edit Workstation
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
                                this.props.selectedWorkstation.name
                                    ? this.props.selectedWorkstation.name
                                    : ""
                            }
                            onChange={e => this.props.changeProperty("name", e.target.value)}
                            invalid={!this.props.selectedWorkstation.name}
                        />
                        <FormFeedback>Item name is required</FormFeedback>
                    </FormGroup>
                    {(this.props.disableSpaceEditing) && (
                        <div className="form-group">
                            <label>Room</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={true}
                                value={
                                    this.props.selectedWorkstation.space
                                        ? `${this.props.selectedWorkstation.space.roomNumber} ${
                                              this.props.selectedWorkstation.space.bldgName
                                          }`
                                        : ""
                                }
                            />
                        </div>
                    )}
                    {(!this.props.disableSpaceEditing) && (
                        <FormGroup>
                            <Label for="room">Room</Label>
                            <SearchSpaces
                                onSelect={space => this.props.changeProperty("space", space)}
                                defaultSpace={
                                    this.props.space
                                        ? this.props.space
                                        : this.props.selectedWorkstation.space
                                }
                                isRequired={true}
                            />
                        </FormGroup>
                    )}

                    <div className="form-group">
                        <label>Tags</label>
                        <SearchTags
                            tags={this.props.tags}
                            disabled={this.props.disableEditing}
                            selected={
                                !!this.props.selectedWorkstation.tags
                                    ? this.props.selectedWorkstation.tags.split(",")
                                    : []
                            }
                            onSelect={e => this.props.changeProperty("tags", e.join(","))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            className="form-control"
                            disabled={this.props.disableEditing}
                            value={
                                this.props.selectedWorkstation.notes ? this.props.selectedWorkstation.notes : ""
                            }
                            onChange={e => this.props.changeProperty("notes", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
