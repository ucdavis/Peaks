import * as PropTypes from "prop-types";
import * as React from "react";
import { AppContext, IPerson } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    person: IPerson;
}

export default class BioContainer extends React.Component<IProps, {}> {
    public static contextTypes = {
        fetch: PropTypes.func
    };
    public context: AppContext;
    public render() {
        return (
            <div className="card-content person-card">
              <div className="row justify-content-between">
              <div className="person-col">
                <h4>Employment Details</h4>
                              <ul className="two-col no-list-style">
                                {this.props.person.title &&
                                      <li className="person-label">Title</li>
                                }
                              {this.props.person.category && <li>Category</li>}
                              {this.props.person.startDate && (
                                  <li className="person-label">
                                      Start Date
                                  </li>
                              )}
                              {this.props.person.endDate && (
                                  <li className="person-label">
                                      End Date
                                  </li>
                              )}
                              {this.props.person.supervisor && (
                                  <li className="person-label">

                                      Supervisor
                                  </li>
                              )}

                                {this.props.person.title &&
                                    <li>
                                      {this.props.person.title}
                                    </li>
                                }
                                {this.props.person.category && <li>{this.props.person.category}</li>}
                                {this.props.person.startDate && (
                                    <li>
                                        {DateUtil.formatExpiration(this.props.person.startDate)}
                                    </li>
                                )}

                                {this.props.person.endDate && (
                                    <li>

                                        {DateUtil.formatExpiration(this.props.person.endDate)}
                                    </li>
                                )}
                                {this.props.person.supervisor && (
                                    <li>

                                        {this.props.person.supervisor.name}
                                    </li>
                                )}
                              </ul>
              </div>
              <div className="person-col">
                <h4>Contact Details</h4>
                <ul className="two-col no-list-style">
                {this.props.person.email && (
                    <li className="person-label">

                      Email
                    </li>)}
                    {this.props.person.homePhone && (
                        <li className="person-label">

                            Home
                        </li>
                    )}
                    {this.props.person.teamPhone && (
                        <li className="person-label">

                            Team
                        </li>
                    )}



                                    {this.props.person.email && (
                                        <li>

                                            {this.props.person.email}
                                        </li>
                                    )}
                                    {this.props.person.homePhone && (
                                        <li>

                                            {this.props.person.homePhone}
                                        </li>
                                    )}
                                    {this.props.person.teamPhone && (
                                        <li>

                                            {this.props.person.teamPhone}
                                        </li>
                                    )}
                                  </ul>
              </div>
              <div className="person-col">
                <h4>Tags</h4>
                <ul className="no-list-style">
                  {this.props.person.tags && (
                      <li>
                        {this.props.person.tags}
                      </li>
                  )}
                </ul>
              </div>

</div>
<div className="notes-deets">
  <h4>Notes</h4>
                  {this.props.person.notes && (
                      <p className="card-text">

                          {this.props.person.notes}
                      </p>
                  )}
</div>
            </div>
        );
    }
}
