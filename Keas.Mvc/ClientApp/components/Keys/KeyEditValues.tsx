import * as React from "react";

import SearchTags from "../Tags/SearchTags";

import { IKey } from "../../Types";

interface IProps {
    selectedKey: IKey;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    searchableTags: string[]
}

export default class KeyEditValues extends React.Component<IProps, {}> {

    public render() {
        const { name, code, tags } = this.props.selectedKey;

        const parsedTags = tags ? tags.split(',') : [];

        return (
            <div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={name}
                        onBlur={this.onBlurName}
                        onChange={this.onChangeName}
                        required={true}
                        minLength={1}
                    />
                </div>
                <div className="form-group">
                    <label>Code</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={code}
                        onBlur={this.onBlurCode}
                        onChange={this.onChangeCode}
                        required={true}
                        minLength={1}
                        maxLength={10}
                    />
                </div>
                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags
                        tags={this.props.searchableTags} 
                        disabled={this.props.disableEditing}
                        selected={parsedTags}
                        onSelect={this.onChangeTags} />
                </div>
            </div>
        );
    }

    private onBlurName = () => {
        let { name } = this.props.selectedKey;

        // trim name
        name = name.trim();

        this.props.changeProperty("name", name)
    }

    private onBlurCode = () => {
        let { code } = this.props.selectedKey;

        // trim name
        code = code.trim();

        this.props.changeProperty("code", code)
    }

    private onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("name", event.target.value)
    }

    private onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // use upper
        value = value.toUpperCase();

        this.props.changeProperty("code", value)
    }

    private onChangeTags = (tags: string[]) => {
        const value = tags.join(',');

        this.props.changeProperty("tags", value)
    }
}
