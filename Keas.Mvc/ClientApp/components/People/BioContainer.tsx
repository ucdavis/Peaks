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
                <div className="row justify-content-between">
                  <div className="person-label-list">
                    {this.props.person.title &&
                          <p className="person-label">Title</p>
                    }
                    {this.props.person.category && <p>Category</p>}
                    {this.props.person.startDate && (
                      <p className="person-label">
                          Start Date
                      </p>
                    )}
                    {this.props.person.endDate && (
                      <p className="person-label">
                          End Date
                      </p>
                    )}
                    {this.props.person.supervisor && (
                      <p className="person-label">

                          Supervisor
                      </p>
                  )}
                  </div>
                  <div>
                    {this.props.person.title &&
                        <p>
                          {this.props.person.title}
                        </p>
                    }
                    {this.props.person.category && <p>{this.props.person.category}</p>}
                    {this.props.person.startDate && (
                        <p>
                            {DateUtil.formatExpiration(this.props.person.startDate)}
                        </p>
                    )}

                    {this.props.person.endDate && (
                        <p>

                            {DateUtil.formatExpiration(this.props.person.endDate)}
                        </p>
                    )}
                    {this.props.person.supervisor && (
                        <p>

                            {this.props.person.supervisor.name}
                        </p>
                    )}
                  </div>
                </div>

              </div>
              <div className="person-col">
                <h4>Contact Details</h4>
                <div className="row justify-content-between">
                  <div className="person-label-list">
                  {this.props.person.email && (
                      <p className="person-label">
                        Email
                      </p>)}
                      {this.props.person.homePhone && (
                          <p className="person-label">
                              Home
                          </p>
                      )}
                      {this.props.person.teamPhone && (
                          <p className="person-label">
                              Team
                          </p>
                      )}
                  </div>
                  <div>
                      {this.props.person.email && (
                          <p>

                              {this.props.person.email}
                          </p>
                      )}
                      {this.props.person.homePhone && (
                          <p>

                              {this.props.person.homePhone}
                          </p>
                      )}
                      {this.props.person.teamPhone && (
                          <p>

                              {this.props.person.teamPhone}
                          </p>
                      )}
                    </div>
                </div>


              </div>
              <div className="person-col">
                <h4>Tags</h4>
                <ul className="no-list-style">
                  {this.props.person.tags && (
                      <p>
                        {this.props.person.tags}
                      </p>
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
