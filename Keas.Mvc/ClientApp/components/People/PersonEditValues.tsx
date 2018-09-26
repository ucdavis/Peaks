import * as React from "react";

import { ISpace, IPerson } from "../../Types";
import AssignSpace from "../Spaces/AssignSpace";
import SearchTags from "../Tags/SearchTags";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    tags?: string[];
    disableEditing: boolean;
    selectedPerson: IPerson;
    space?: ISpace;
    creating?: boolean;
}

export default class PersonEditValues extends React.Component<IProps, {}> {

    public render() {
        if(!this.props.selectedPerson)
        {
            return null;
        }
        return (
            <div>
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedPerson.firstName ? this.props.selectedPerson.firstName : ""}
                        onChange={(e) => this.props.changeProperty("firstName", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedPerson.lastName ? this.props.selectedPerson.lastName : ""}
                        onChange={(e) => this.props.changeProperty("lastName", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedPerson.email ? this.props.selectedPerson.email : ""}
                        onChange={(e) => this.props.changeProperty("email", e.target.value)}
                    />
                </div>
                
                
                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags 
                        tags={this.props.tags} 
                        disabled={this.props.disableEditing}
                        selected={!!this.props.selectedPerson.tags ? this.props.selectedPerson.tags.split(",") : []}
                        onSelect={(e) => this.props.changeProperty("tags", e.join(","))} />
                </div>

            </div>
        );
    }
}
