import * as PropTypes from "prop-types";
import * as React from "react";
import { Button } from "reactstrap";
import { AppContext, IPerson } from "../../Types";
import { DateUtil } from "../../util/dates";

interface IProps {
    person: IPerson;
}

export default class BioContainer extends React.Component<IProps, {}> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    public render() {
        return (
            <div>
                <h2>{this.props.person.name}</h2>
                {this.props.person.title && <p>{this.props.person.title}</p>}
                {this.props.person.category && <p>{this.props.person.category}</p>}
                {this.props.person.startDate && (
                    <p>
                        <i className="fas fa-hourglass-start" aria-hidden="true" />{" "}
                        {DateUtil.formatExpiration(this.props.person.startDate)}
                    </p>
                )}
                {this.props.person.endDate && (
                    <p>
                        <i className="fas fa-hourglass-end" aria-hidden="true" />{" "}
                        {DateUtil.formatExpiration(this.props.person.endDate)}
                    </p>
                )}
                {this.props.person.supervisor && (
                    <p>
                        <i className="fas fa-user-tie" aria-hidden="true" />{" "}
                        {this.props.person.supervisor.name}
                    </p>
                )}
                {this.props.person.isSupervisor && (
                     <p>
                     <a
                         href={`/${
                             this.context.team.slug
                         }/Report/SupervisorDirectReports/?personId=${
                             this.props.person.id
                         }`}
                         target="_blank"
                     >
                         <Button className="btn btn-link">
                            <i
                                className="fas fa-search fa-sm fa-fw mr-2"
                                aria-hidden="true"
                            />
                            See who this person supervises
                        </Button>
                     </a>
                 </p>
                )}
                {this.props.person.email && (
                    <p>
                        <i className="far fa-envelope" aria-hidden="true" />{" "}
                        {this.props.person.email}
                    </p>
                )}
                {this.props.person.homePhone && (
                    <p className="card-text">
                        <i className="fas fa-home" aria-hidden="true" />{" "}
                        {this.props.person.homePhone}
                    </p>
                )}
                {this.props.person.teamPhone && (
                    <p className="card-text">
                        <i className="fas fa-briefcase" aria-hidden="true" />{" "}
                        {this.props.person.teamPhone}
                    </p>
                )}
                {this.props.person.tags && (
                    <p className="card-text">
                        <i className="fas fa-tags" aria-hidden="true" /> {this.props.person.tags}
                    </p>
                )}
                {this.props.person.notes && (
                    <p className="card-text">
                        <i className="fas fa-sticky-note" aria-hidden="true" />{" "}
                        {this.props.person.notes}
                    </p>
                )}
                <br />
            </div>
        );
    }
}
