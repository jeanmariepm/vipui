import React, { Component } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";

import bridgeService from "../../services/bridgeService";
import Table from "../common/table";
import Pagination from "../common/pagination";
import ListGroup from "../common/listGroup";

class DealsTable extends Component {
  columns = [
    {
      path: "id",
      label: "ID",
      content: (deal) => (
        <Link
          to={{
            pathname: "/bridge",
            state: {
              hands: `${deal.hands}`,
              auction: `${deal.auction}`,
            },
          }}
        >
          {deal.id}
        </Link>
      ),
    },
    { path: "hands", label: "Hands" },
    { path: "auction", label: "Auction" },
    { path: "username", label: "By" },
    { path: "saved_date", label: "At" },
  ];

  deleteColumn = {
    key: "delete",
    content: (deal) => (
      <button
        onClick={() => this.props.onDelete(deal)}
        className="btn btn-danger btn-sm"
      >
        Delete
      </button>
    ),
  };

  render() {
    const { deals, onSort, sortColumn } = this.props;
    return (
      <Table
        columns={this.columns}
        data={deals}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default DealsTable;
