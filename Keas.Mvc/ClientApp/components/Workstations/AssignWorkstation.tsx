import * as moment from "moment";
import PropTypes from "prop-types";
import * as React from "react";
import DatePicker from "react-datepicker";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, IPerson, IWorkstation } from "../../Types";
import AssignPerson from "../Biographical/AssignPerson";
import HistoryContainer from "../History/HistoryContainer";
import WorkstationEditValues from "./WorkstationEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    returnToSpaceDetails: (spaceId: number) => void;
    updateCount: (spaceId: number) => void;
    workstationId: number;
}

interface IState{
    date: any;
    error: string;
    loading: boolean;
    person: IPerson;
    validState: boolean;
    workstation: IWorkstation;
}

export default class AssignWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            date: moment().add(3, "y"),
            error: "",
            loading: false,
            person: null,
            validState: false,
            workstation: null,
        };
    }

    public componentDidMount() {
        if(this.props.modal && this.props.workstationId !== null) {
            this._loadData(this.props.workstationId);
        }
    }

    public componentDidUpdate(prevProps) {
        if(!this.props.modal && prevProps.modal && this.props.workstationId === null) {
            // if we've closed this modal, reset state
            console.log("reset");
            this.setState({
                date: moment().add(3, "y"),
                error: "",
                loading: false,
                person: null,
                validState: false,
                workstation: null
            });
        }
        else if(this.props.modal && this.props.workstationId !== prevProps.workstationId)
        {
            this._loadData(this.props.workstationId);
        }
    }

    public render() {
        if (this.props.workstationId === null) 
        {
            return null;
        }
        if(this.state.loading) 
        {
            return <h2>Loading...</h2>;
        }
        return (
            <div>
                {!!this.state.workstation && this._renderFound()}
                {!this.state.workstation && this._renderNotFound()}
            </div>
        );
    }

    private _renderNotFound = () => {
        return (
            <Modal isOpen={this.props.modal}
                toggle={this.props.closeModal} 
                size="lg">
                <ModalHeader>Workstation not found, please try again</ModalHeader>
                <ModalFooter>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private _renderFound = () => {
        return (
            <Modal isOpen={this.props.modal} 
                toggle={this.props.closeModal} 
                size="lg">
                <ModalHeader>Assign Workstation</ModalHeader>
          <ModalBody>
            <div className="container-fluid">
              <form>
                <div className="form-group">
                  <label htmlFor="assignto">Assign To</label>
                  <AssignPerson
                    person={this.state.person}
                    onSelect={this._onSelectPerson}
                  />
                </div>
                {this.state.workstation &&
                  !!this.state.workstation.teamId && (
                    <WorkstationEditValues
                      selectedWorkstation={this.state.workstation}
                      disableEditing={true}
                      />
                  )}

                {(!!this.state.person) && (
                  <div className="form-group">
                    <label>Set the expiration date</label>
                    <DatePicker
                      selected={this.state.date}
                      onChange={this._changeDate}
                      onChangeRaw={this._changeDateRaw}
                      className="form-control"
                    />
                  </div>
                )}
                {this.state.error}
              </form>
            </div>
          </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => this.props.returnToSpaceDetails(this.state.workstation.space.id)}>
                        Return To Space
                    </Button>
                    <Button color="primary" onClick={this._assignSelected}>
                        Save
                    </Button>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private _loadData = async (id: number) => {
        this.setState({ loading: true });
        const workstation =
            await this.context.fetch(`/api/${this.context.team.name}/workstations/details?id=${id}`);
        this.setState({ workstation, loading: false });
    }

    private _changeProperty = (property: string, value: string) => {
      this.setState({
        workstation: {
          ...this.state.workstation,
          [property]: value
        }
      }, this._validateState);
    };

    private _validateState = () => {
        let valid = true;
        if (!this.state.workstation) {
          valid = false;
        } else if (!this.state.person) {
            valid = false;
        } else if (this.state.error !== "") {
          valid = false;
        } else if (!this.state.date) {
          valid = false;
        } else if (moment().isSameOrAfter(this.state.date)) {
            valid = false;
        } 
        this.setState({ validState: valid });
      };

    private _assignSelected = async () => {
        if (!this.state.validState) {
          return;
        }
    
        // this.state.workstation.attributes = this.state.workstation.attributes.filter(x => !!x.key);
        
        if(!!this.state.person) {
            const assignUrl = `/api/${this.context.team.name}/workstations/assign?workstationId=${this.state.workstation.id}&personId=${
                this.state.person.id
              }&date=${this.state.date.format()}`;
        
              const workstation = await this.context.fetch(assignUrl, {
                method: "POST"
              });
        }

        this.props.updateCount(this.state.workstation.space.id);
        this.props.returnToSpaceDetails(this.state.workstation.space.id);
      };
      

      private _onSelectPerson = (person: IPerson) => {
        this.setState({ person }, this._validateState);
      };    
    
      private _changeDate = newDate => {
        this.setState({ date: newDate, error: "" }, this._validateState);
      };
    
      private _changeDateRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const m = moment(value, "MM/DD/YYYY", true);
        if (m.isValid()) {
          this._changeDate(m);
        } else {
          this.setState({ date: null, error: "Please enter a valid date" });
        }
      };
}
