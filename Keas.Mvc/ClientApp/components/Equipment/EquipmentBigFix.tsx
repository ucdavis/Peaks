import * as React from "react";
import EquipmentBigFixInfo from "./EquipmentBigFixInfo";
import EquipmentBigFixSearchId from "./EquipmentBigFixSearchId";

interface IProps {
    bigfixId: string;
    addBigFixId: (property: string, id: string) => void;
    disableEditing: boolean;
}

export default class EquipmentBigFix extends React.Component<IProps, {}> {
    public render() {
        return (
            <>
                <div className="d-flex">
                    <label> Bigfix Id</label>
                    <span />
                    {this._renderBigFixInfoOrSearchId()}
                </div>
            </>
        );
    }

    private _renderBigFixInfoOrSearchId = () => {
        // if no Bigfix Id exist
        if (!this.props.bigfixId) {
            // if editing disabled
            if (this.props.disableEditing) {
                return (
                    <span className="ml-3">
                        ( Click Edit Equipment above to search for Bigfix Id )
                    </span>
                );
            }
            // if editing is enabled
            return <EquipmentBigFixSearchId addBigFixId={this.props.addBigFixId} />;
        }

        // if Bigfix Id exists
        return <EquipmentBigFixInfo bigfixId={this.props.bigfixId} />;
    };
}
