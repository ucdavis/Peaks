import * as React from "react";
import {
    Button,
} from "reactstrap";
import { IKey, IKeyInfo } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import SpacesContainer from "../Spaces/SpacesContainer";
import KeySerialContainer from "./KeySerialContainer";

interface IProps {
    goBack: () => void;
    openEditModal: (key: IKey) => void;
    selectedKeyInfo: IKeyInfo;
    serialInUseUpdated: (keyId: number, count: number) => void;
    serialTotalUpdated: (keyId: number, count: number) => void;
    spacesTotalUpdated: (keyId: number, count: number) => void;
}

export default class KeyDetailContainer extends React.Component<IProps, {}> {

    public render() {
        const { selectedKeyInfo } = this.props;

        if (!selectedKeyInfo || !selectedKeyInfo.key)
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
                <h2 className="mb-3">{selectedKeyInfo.key.name} - {selectedKeyInfo.key.code}</h2>
                { selectedKeyInfo.key.tags && 
                    <p>
                        <i className="fas fa-tags mr-2" aria-hidden="true" />{ selectedKeyInfo.key.tags }
                    </p>
                }
                <div className="mb-3">
                    <Button color="link" onClick={() => this.props.openEditModal(selectedKeyInfo.key)}>
                        <i className="fas fa-edit fa-xs"/> Edit Key
                    </Button>
                </div>
                <KeySerialContainer selectedKey={selectedKeyInfo.key} assetInUseUpdated={this._serialInUseUpdated} assetTotalUpdated={this._serialTotalUpdated} />
                <SpacesContainer selectedKeyInfo={selectedKeyInfo} spacesTotalUpdated={this.props.spacesTotalUpdated} />
                <HistoryContainer controller="keys" id={selectedKeyInfo.id} />
            </div>
        );
    }
    
    private _serialInUseUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        this.props.serialInUseUpdated(this.props.selectedKeyInfo.id, count);
    }
    private _serialTotalUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        this.props.serialTotalUpdated(this.props.selectedKeyInfo.id, count);
    }
}
