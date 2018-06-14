import * as React from "react";

import { ISpace, IWorkstation } from "../../Types";
import AssignSpace from "../Spaces/AssignSpace";
import SearchTags from "../Tags/SearchTags";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    tags?: string[];
    disableEditing: boolean;
    selectedWorkstation: IWorkstation;
    creating?: boolean;
}

export default class WorkstationEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                {!this.props.creating &&
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedWorkstation.name ? this.props.selectedWorkstation.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>}
                {this.props.selectedWorkstation.assignment != null &&
                <div>
                <div className="form-group">
                    <label>Assigned To</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedWorkstation.assignment.person.user.name}
                        />
                </div>
                <div className="form-group">
                    <label>Expires at</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedWorkstation.assignment.expiresAt.toString()}
                        />
                </div>
                </div>
                }
                
                <div className="form-group">
                    <label>Room</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedWorkstation.space ?
                            `${this.props.selectedWorkstation.space.roomNumber} ${this.props.selectedWorkstation.space.bldgName}` : ""}
                    />
                </div>
              
                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags 
                        tags={this.props.tags} 
                        disabled={this.props.disableEditing}
                        defaultValues={!!this.props.selectedWorkstation.tags ? this.props.selectedWorkstation.tags.split(",") : []}
                        onSelect={(e) => this.props.changeProperty("tags", e.join(","))} />
                </div>

            </div>
        );
    }
}
