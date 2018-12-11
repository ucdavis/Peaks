import * as React from "react";
import {
    Button,
} from "reactstrap";

import { IKey, IKeySerial } from "../../Types";

import HistoryContainer from "../History/HistoryContainer";
import KeySerialContainer from "./KeySerialContainer";
import SpacesContainer from "../Spaces/SpacesContainer";

interface IProps {
    goBack: () => void;
    selectedKey: IKey;
    serialInUseUpdated: (keyId: number, count: number) => void;
    serialTotalUpdated: (keyId: number, count: number) => void;
}

export default class KeyDetailContainer extends React.Component<IProps, {}> {

    public render() {
        const { selectedKey } = this.props;

        if (!selectedKey)
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
                <KeySerialContainer selectedKey={selectedKey} assetInUseUpdated={this._serialInUseUpdated} assetTotalUpdated={this._serialTotalUpdated} />
                <SpacesContainer selectedKey={selectedKey} />
                <HistoryContainer controller="keys" id={selectedKey.id} />
            </div>
        );
    }
    
    private _serialInUseUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        this.props.serialInUseUpdated(this.props.selectedKey.id, count);
    }
    private _serialTotalUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        this.props.serialTotalUpdated(this.props.selectedKey.id, count);
    }
}
