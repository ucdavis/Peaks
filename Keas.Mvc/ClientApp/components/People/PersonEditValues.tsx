import * as moment from "moment";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IPerson, ISpace } from "../../Types";
import SearchTags from "../Tags/SearchTags";
import AssignPerson from "./AssignPerson";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    changeSupervisor?: (supervisor: IPerson) => void;
    tags?: string[];
    disableEditing: boolean;
    selectedPerson: IPerson;
    space?: ISpace;
    creating?: boolean;
}

export default class PersonEditValues extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedPerson) {
            return null;
        }
        return (
            <div>
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.firstName
                                ? this.props.selectedPerson.firstName
                                : ""
                        }
                        onChange={e => this.props.changeProperty("firstName", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.lastName
                                ? this.props.selectedPerson.lastName
                                : ""
                        }
                        onChange={e => this.props.changeProperty("lastName", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.email ? this.props.selectedPerson.email : ""
                        }
                        onChange={e => this.props.changeProperty("email", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Home Phone Number</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.homePhone
                                ? this.props.selectedPerson.homePhone
                                : ""
                        }
                        onChange={e => this.props.changeProperty("homePhone", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Team Phone Number</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.teamPhone
                                ? this.props.selectedPerson.teamPhone
                                : ""
                        }
                        onChange={e => this.props.changeProperty("teamPhone", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.title ? this.props.selectedPerson.title : ""
                        }
                        onChange={e => this.props.changeProperty("title", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Start Date</label>
                    <DatePicker
                        selected={
                            this.props.selectedPerson && this.props.selectedPerson.startDate
                                ? moment(this.props.selectedPerson.startDate)
                                : null
                        }
                        onChange={this._changeStartDate}
                        onChangeRaw={this._changeStartDateRaw}
                        className="form-control"
                        showMonthDropdown={true}
                        showYearDropdown={true}
                        dropdownMode="select"
                    />
                </div>

                <div className="form-group">
                    <label>End Date</label>
                    <DatePicker
                        selected={
                            this.props.selectedPerson && this.props.selectedPerson.endDate
                                ? moment(this.props.selectedPerson.endDate)
                                : null
                        }
                        onChange={this._changeEndDate}
                        onChangeRaw={this._changeEndDateRaw}
                        className="form-control"
                        showMonthDropdown={true}
                        showYearDropdown={true}
                        dropdownMode="select"
                    />
                </div>

                <div className="form-group">
                    <label>Supervisor</label>
                    <AssignPerson
                        disabled={this.props.disableEditing}
                        onSelect={this.props.changeSupervisor}
                        person={this.props.selectedPerson.supervisor}
                        isRequired={false}
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        onChange={e => this.props.changeProperty("category", e.target.value)}
                        className="form-control"
                        value={
                            this.props.selectedPerson.category
                                ? this.props.selectedPerson.category
                                : "Faculty"
                        }
                    >
                        <option value="Faculty">Faculty</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin Staff">Admin Staff</option>
                        <option value="Grad Student">Grad Student</option>
                        <option value="Undergrad">Undergrad</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Volunteer">Volunteer</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={
                            this.props.selectedPerson.notes || ""
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
                            !!this.props.selectedPerson.tags
                                ? this.props.selectedPerson.tags.split(",")
                                : []
                        }
                        onSelect={e => this.props.changeProperty("tags", e.join(","))}
                    />
                </div>
            </div>
        );
    }

    private _changeStartDate = (date: any) => {
        this.props.changeProperty("startDate", date.startOf("day"));
    };

    private _changeEndDate = (date: any) => {
        this.props.changeProperty("endDate", date.startOf("day"));
    };

    private _changeStartDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const m = moment(value, "MM/DD/YYYY", true);
        if (m.isValid()) {
            this._changeStartDate(m);
        } else {
            this.setState({ date: null, error: "Please enter a valid date" });
        }
    };

    private _changeEndDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const m = moment(value, "MM/DD/YYYY", true);
        if (m.isValid()) {
            this._changeStartDate(m);
        } else {
            this.setState({ date: null, error: "Please enter a valid date" });
        }
    };
}
