import React, { Component } from "react";
import Deal from "./deal";
import Hand from "./hand";
import Auction from "./auction";
import BidBox from "./bidBox";
import Agent from "./agent";
import DealControl from "./dealControl";
import bridgeService from "../../services/bridgeService";
import authService from "../../services/authService";
//import Login from "../nav/login";

const playerNames = { 0: "West", 1: "North", 2: "East", 3: "South" };
class Bridge extends Component {
  constructor(props) {
    super(props);
    this.begin = true;
    this.state = { bids: [], needsLogin: false };
  }
  componentDidMount() {
    this.startDeal();
  }

  startDeal = () => {
    this.deal = new Deal();

    if (this.begin && this.props.location.state) {
      const { hands, auction } = this.props.location.state;

      this.deal.setHands(JSON.parse(hands));
      this.auction = JSON.parse(auction);
    }

    this.agents = [];
    for (let a = 0; a < 4; a++) {
      this.agents.push(new Agent(this.deal.getHand(a)));
    }
    this.dealer = this.deal.getDealer();
    this.player = this.dealer;
    this.aiBid = this.agents[this.player].getBid();
    this.setState({ bids: [], needsLogin: false });
  };
  doneDeal = () => {
    console.log("Redirect to Review page ", this.props);
    this.props.history.goBack();
  };

  nextDeal = () => {
    this.startDeal();
    this.auction = null;
    this.begin = false;
  };
  saveDeal = async () => {
    const hands = JSON.stringify(this.deal.hands);
    const auction = JSON.stringify(this.state.bids);
    const user_id = authService.getCurrentUserId();
    await bridgeService.saveDeal(hands, auction, user_id);
  };

  getGoingBid = () => {
    let bids = [...this.state.bids];
    let bid;
    while ((bid = bids.pop())) {
      if (bid.match(/^\d/)) {
        return bid;
      }
    }
    return null;
  };

  placeBid = (bid) => {
    const bids = [...this.state.bids, bid];
    this.player = (this.dealer + bids.length) % 4;
    this.aiBid = this.agents[this.player].getBid(bids);
    this.setState({ bids });
  };

  undoBid = () => {
    console.log("Undoing last bid...");
    const bids = [...this.state.bids];
    bids.pop();
    this.player = (this.dealer + bids.length) % 4;
    this.aiBid = this.agents[this.player].getBid(bids);
    this.setState({ bids });
  };

  biddingOver = () => {
    const bids = [...this.state.bids];
    if (bids.length >= 4) {
      const l = bids.length;
      if (bids[l - 1] === "P" && bids[l - 2] === "P" && bids[l - 3] === "P")
        return true;
    }
    return false;
  };
  getDoubleOption = () => {
    const bids = [...this.state.bids];
    let option;
    const l = bids.length;

    if (l === 0) return option;

    const lastBid = bids[l - 1];
    if (lastBid === "X") option = "XX";
    else if (lastBid !== "P") option = "X";
    else if (l >= 3) {
      const partnerBid = bids[l - 2];
      const lhoBid = bids[l - 3];
      if (partnerBid === "P") {
        if (lhoBid === "X") option = "XX";
        else if (lhoBid !== "P") option = "X";
      }
    }
    return option;
  };

  render() {
    if (this.deal) return this.showHands(this.player);
    return null;
  }

  showOneHand(bidder, seat) {
    if (this.biddingOver() || bidder === seat)
      return (
        <React.Fragment>
          <Hand cards={this.deal.getHand(seat)} name={playerNames[seat]} />
        </React.Fragment>
      );
    return <Hand name={playerNames[seat]} />;
  }

  showHands(bidder) {
    return (
      <table className="table table-sm">
        <tbody>
          <tr className="row">
            <td className="col">
              {this.auction && (
                <Auction
                  title={"Saved Auction"}
                  dealer={this.dealer}
                  bids={this.auction}
                  biddingOver={true}
                />
              )}
            </td>
            <td className="col">{this.showOneHand(bidder, 1)} </td>
            <td className="col">
              {(this.auction || this.biddingOver()) && (
                <DealControl
                  undoBid={
                    this.state.bids &&
                    this.state.bids.length > 0 &&
                    this.undoBid
                  }
                  saveDeal={this.saveDeal}
                  nextDeal={this.nextDeal}
                  doneDeal={this.doneDeal}
                  practiceMode={!this.auction}
                />
              )}
            </td>
          </tr>
          <tr className="row">
            <td className="col">{this.showOneHand(bidder, 0)} </td>
            <td className="col">
              <Auction
                dealer={this.dealer}
                bids={this.state.bids}
                aiBid={this.aiBid}
                biddingOver={this.biddingOver()}
              />
            </td>
            <td className="col">{this.showOneHand(bidder, 2)} </td>
          </tr>
          <tr className="row">
            <td className="col"></td>
            <td className="col">{this.showOneHand(bidder, 3)} </td>
            <td className="col">
              {!this.biddingOver() && (
                <BidBox
                  placeBid={this.placeBid}
                  undoBid={this.undoBid}
                  goingBid={this.getGoingBid()}
                  allowUndo={this.state.bids.length > 0}
                  doubleOption={this.getDoubleOption()}
                  aiBid={this.aiBid}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default Bridge;
