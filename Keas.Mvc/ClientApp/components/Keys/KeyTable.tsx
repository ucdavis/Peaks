import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";

import { IKey } from "../../Types";

interface IProps {
    filters: any[]
    onFiltersChange: (filters: any[]) => void,
    keys: IKey[];
    showDetails?: (key: IKey) => void;
}

interface IState {
}

interface IFilter {
    id: string;
    value: any;
}

interface IRow {
    original: IKey;
}

export default class KeyTable extends React.Component<IProps, IState> {


  public render() {
    const { filters, keys } = this.props;

      return (
        <ReactTable
            data={keys}
            filterable={true}
            minRows={1}
            filtered={filters}
            onFilteredChange={this.props.onFiltersChange}
            columns = {[
                {
                    Header: "Actions",
                    headerClassName: "key-details",
                    filterable: false,
                    sortable: false,
                    resizable: false,
                    className: "key-details",
                    Cell: (row: IRow) => (
                        <Button color="link" onClick={() => this.props.showDetails(row.original)}>
                            Details
                        </Button>
                    ),
                    maxWidth: 150,
                },
                {
                    Header: "Key",
                    accessor: "name",
                    className: "word-wrap",
                    filterMethod: (filter: IFilter, row: IRow) =>
                        !!row[filter.id] &&
                        row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    ,
                },
                {
                    Header: "Key Code",
                    accessor: "code",
                    filterMethod: (filter: IFilter, row: IRow) =>
                        !!row[filter.id] &&
                        row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
                },
            ]}
        />
    );
  }
}
