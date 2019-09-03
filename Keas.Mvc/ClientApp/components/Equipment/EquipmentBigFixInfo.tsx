import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from "reactstrap";

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

    public toggle = () => {
        this.setState({
            bigfixModal: !this.state.bigfixModal
        });
    };

    public render() {
        return (
            <>
                <label>
                    Bigfix Id
                    <a
                        onClick={() => {
                            this.toggle();
                            this.getBigFixComputerInfo(this.props.bigfixId || "");
                        }}
                    >
                        <i className=" ml-2 fas fa-info-circle" />
                    </a>
                </label>
                {this.renderBigFixModal()}
            </>
        );
    }

    private renderBigFixModal = () => {
        return (
            <Modal isOpen={this.state.bigfixModal} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>Computer Details</ModalHeader>
                <ModalBody className="d-flex justify-content-center">
                    {this.renderModalBody()}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
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
