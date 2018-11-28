import * as React from "react";
import {
    Button,
} from "reactstrap";

import { IKey } from "../../Types";

import HistoryContainer from "../History/HistoryContainer";
import KeySerialContainer from "./KeySerialContainer";
import SpacesContainer from "../Spaces/SpacesContainer";

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
                <div className="mb-3">
                    <Button color="link" onClick={this.props.goBack}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
                <h2 className="mb-3">{selectedKey.name} - {selectedKey.code}</h2>
                { selectedKey.tags && 
                    <p>
                        <i className="fas fa-tags mr-2" aria-hidden="true" />{ selectedKey.tags }
                    </p>
                }
                <KeySerialContainer selectedKey={selectedKey} />
                <SpacesContainer selectedKey={selectedKey} />
                <HistoryContainer controller="keys" id={selectedKey.id} />
            </div>
        );
    }
}
