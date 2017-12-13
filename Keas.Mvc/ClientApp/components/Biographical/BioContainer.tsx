import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../../Types";

export default class BioContainer extends React.Component<{}, {}> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
    };
    public context: AppContext;
    public render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">
                        {this.context.person.user.name}
                    </h4>
                    <p className="card-text">
                        <i className="fa fa-envelope-o" aria-hidden="true" />{" "}
                        {this.context.person.user.email}
                    </p>
                </div>
            </div>
        );
    }
}
