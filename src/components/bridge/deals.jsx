import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import DealsTable from "./dealsTable";
import ListGroup from "../common/listGroup";
import Pagination from "../common/pagination";
import bridgeService from "../../services/bridgeService";
import { getUsers } from "../../services/userService";
import { paginate } from "../../utils/paginate";
import _ from "lodash";
import SearchBox from "../common/searchBox";

class Deals extends Component {
  state = {
    deals: [],
    allPlayers: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    selectedUser: null,
    sortColumn: { path: "id", order: "asc" },
  };
  componentDidMount() {
    this.loadDeals();
  }
  loadDeals = async () => {
    let allPlayers, deals;
    /*     await bridgeService.getPlayers((data) => {
      allPlayers = [{ id: "", username: "All Players" }, ...data];

      console.log("All Players:", allPlayers);
    });
 */ await bridgeService.getDeals((data) => {
      deals = data;
      console.log("All deals:", deals);
    });
    this.setState({ deals, allPlayers });
  };

  handleDelete = async (deal) => {
    const originalDeals = this.state.deals;
    const deals = originalDeals.filter((m) => m._id !== deal._id);
    this.setState({ deals });

    try {
      await bridgeService.deleteDeal(deal._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This deal has already been deleted.");

      this.setState({ deals: originalDeals });
    }
  };

  handleLike = (deal) => {
    const deals = [...this.state.deals];
    const index = deals.indexOf(deal);
    deals[index] = { ...deals[index] };
    deals[index].liked = !deals[index].liked;
    this.setState({ deals });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleUserSelect = (user) => {
    this.setState({ selectedUser: user, searchQuery: "", currentPage: 1 });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, selectedUser: null, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      selectedUser,
      searchQuery,
      deals: allDeals,
    } = this.state;

    let filtered = allDeals;
    if (searchQuery)
      filtered = allDeals.filter((m) =>
        m.auction.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else if (selectedUser && selectedUser._id)
      filtered = allDeals.filter((m) => m.user._id === selectedUser._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const deals = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: deals };
  };

  render() {
    console.log("Deals: render()");

    const { length: count } = this.state.deals;
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    if (count === 0) {
      console.log("Deals: None to display");
      return <p>There are no deals in the database.</p>;
    } else {
      console.log(`Deals: ${count} to display`);
    }
    const { totalCount, data: deals } = this.getPagedData();

    return (
      <div className="row">
        {/*         <div className="col-3">
          <ListGroup
            items={this.state.allPlayers}
            textProperty="username"
            valueProperty="id"
            selectedItem={this.state.selectedUser}
            onItemSelect={this.handleUserSelect}
          />
        </div> */}
        <div className="col">
          <p>Showing {totalCount} deals in the database.</p>
          {/*           <SearchBox value={searchQuery} onChange={this.handleSearch} />
           */}{" "}
          <DealsTable
            deals={deals}
            sortColumn={sortColumn}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Deals;
