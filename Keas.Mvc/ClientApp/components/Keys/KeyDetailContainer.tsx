import * as React from "react";
import {
    Button,
} from "reactstrap";
import { IKey } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import KeySerialContainer from "./KeySerialContainer";


interface IProps {
    goBack: () => void;
    selectedKey: IKey;
}

export default class KeyDetailContainer extends React.Component<IProps, {}> {

    public render() {
        const { selectedKey } = this.props;

        if (selectedKey == null)
        {
            return null;
        }

        return (
            <div>
                <div className="modal-header row justify-content-between">
                    <h2>Details for {selectedKey.code}</h2>
                    <Button color="link" onClick={this.props.goBack}>
                        <i className="fas fa-times fa-lg"/>
                    </Button>
                </div>
                <KeySerialContainer selectedKey={selectedKey} />
                <HistoryContainer controller="keys" id={selectedKey.id} />
            </div>
        );
    }
}
