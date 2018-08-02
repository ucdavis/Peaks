import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IEquipment } from "../../Types";
import EquipmentList from "../Equipment/EquipmentList";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    spaceId: number;
}

interface IState {
    equipment: IEquipment[];
    loading: boolean;
}

export default class SpacesDetailsEquipment extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            equipment: [],
            loading: false,
        };
    }

    public async componentDidMount() {
        this.setState({ loading: true });
        const equipment = this.props.spaceId === null ? [] :
            await this.context.fetch(`/api/${this.context.team.name}/equipment/getEquipmentInSpace?spaceId=${this.props.spaceId}`);
        this.setState({ equipment, loading: false });
    }

    public render() {
        if (this.props.spaceId === null)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Equipment...</div>);
        }
        return (
            <div className="form-group">
                <h5><i className="fas fa-laptop fa-xs"></i> Equipment</h5>
                {this.state.equipment.length > 0 ? 
                    this._renderList() : "No Equipment"}
            </div>
        );
    }

    private _openDetailsModal = (equipment: IEquipment) => {
        this.context.router.history.push(
            `../../equipment/details/${equipment.id}`
        );
    };

    private _renderList = () => {
        const equipment = this.state.equipment.map(x => (
            this._renderListItem(x)
      ));

      return (
        <div className="table">
          <table className="table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Number</th>
                <th>Assigned To</th>
                <th>Expiration</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>{equipment}</tbody>
          </table>
        </div>
      );
    }

    private _renderListItem = (equipment: IEquipment) => {
        const hasAssignment = !!equipment.assignment;
        return (
          <tr key={equipment.id}>
            <td>{equipment.serialNumber}</td>
            <td>{equipment.name}</td>
            <td>{hasAssignment ? equipment.assignment.person.user.name : ""}</td>
            <td>
              {hasAssignment ? equipment.assignment.expiresAt : ""}
            </td>
            <td>
              <ListActionsDropdown
                showDetails={() => this._openDetailsModal(equipment)}
                />
            </td>
          </tr>
        );
    }
}