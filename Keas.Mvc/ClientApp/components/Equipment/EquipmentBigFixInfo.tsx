import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, Table } from "reactstrap";

interface IProps {
    bigfixId: string;
}

interface IState {
    bigfixModal: boolean;
    computerInfo: object;
    isFetched: boolean;
}

export default class EquipmentDetails extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        permissions: PropTypes.array,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public state = { bigfixModal: false, computerInfo: {}, isFetched: false };

    public modalToggle = () => {
        this.setState(prevState => ({
            bigfixModal: !prevState.bigfixModal
        }));
    };

    public render() {
        return (
            <>
                <label> Bigfix Id</label>
                <span></span>
                <a className="bigfix-info" href=""
                    onClick={() => {
                        this.modalToggle();
                        this.getBigFixComputerInfo(this.props.bigfixId || "");
                    }}
                >
                    <i className="fas fa-info-circle ml-2" />
                </a>

                {this.renderBigFixModal()}
            </>
        );
    }

    private renderBigFixModal = () => {
        return (
            <Modal
                isOpen={this.state.bigfixModal}
                toggle={this.modalToggle}
                size="lg"
                className="equipment-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>Computer Details</h2>
                    <Button color="link" onClick={this.modalToggle}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>

                <ModalBody className="d-flex justify-content-center">
                    {this.renderModalBody()}
                </ModalBody>
            </Modal>
        );
    };

    private renderModalBody = () => {
        if (this.state.isFetched) {
            return this.renderComputerInfo();
        } else {
            return <i className="fas fa-3x fa-spinner fa-pulse" />;
        }
    };

    private renderComputerInfo = () => {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(this.state.computerInfo).map(key => {
                        return (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{this.state.computerInfo[key]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    };

    private getBigFixComputerInfo = async (id: string) => {
        const response = await this.context.fetch(
            `/api/${this.context.team.slug}/equipment/GetComputer/${id}`,
            {
                method: "GET"
            }
        );

        const sortedResult = Object.keys(response)
            .sort()
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue] = response[currentValue];
                return accumulator;
            }, {});

        this.setState({
            computerInfo: sortedResult,
            isFetched: true
        });
    };
}
