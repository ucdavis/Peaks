import * as React from "react";

import { IKey } from "../../Types";

interface IProps {
    keyEntity: IKey;
}

export default class KeyDetail extends React.Component<IProps, {}> {
    public render() {
        return <li>{this.props.keyEntity.name}</li>;
    }
}
