import * as React from "react";
import PropTypes from "prop-types";

import { IPerson, AppContext } from "../../Types";

export default class BioContainer extends React.Component<{}, {}> {
    static contextTypes = {
        person: PropTypes.object,
        fetch: PropTypes.func
    };
    context: AppContext;
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
