import React, { useState } from "react";
import UndoBid from "./undoBid";
import SuitImage from "./gifs/suitImage";

const BidBox = ({
  placeBid,
  undoBid,
  goingBid,
  allowUndo,
  doubleOption,
  aiBid,
}) => {
  const [bid, setBid] = useState("");
  const styles = {
    fontFamily: ["Courier New"],
    fontSize: "large",
  };
  function onPickBid(event, aiBid) {
    const bid = event.target.value;
    console.log("onPickBid", bid, aiBid);
    if (bid === "Skip") {
      setBid(bid);
      return;
    }
    if (aiBid && (bidReverseMap[bid] || bid) !== aiBid) {
      setBid(bid);
      return;
    } else {
      console.log("Place bid:", bid, aiBid);
      placeBid(bidReverseMap[bid] || bid);
      setBid("");
      return;
    }
  }
  function onConfirmBid() {
    console.log("Confirm bid ...");
    placeBid(bidReverseMap[bid] || bid);
    setBid("");
  }

  function onRetryBid() {
    console.log("Retry bid ...");
    setBid("");
  }
  function onUndoBid() {
    console.log("Undo bid ...");
    undoBid();
    setBid("");
  }

  const bidReverseMap = {
    Pass: "P",
    "1NT": "1T",
    "2NT": "2T",
    "3NT": "3T",
    "4NT": "4T",
    "5NT": "5T",
    "6NT": "6T",
    "7NT": "7T",
    Dbl: "X",
    RDbl: "XX",
  };
  const bidMap = {
    "": "-",
    "1T": "1NT",
    "2T": "2NT",
    "3T": "3NT",
    "4T": "4NT",
    "5T": "5NT",
    "6T": "6NT",
    "7T": "7NT",
    X: "Dbl",
    XX: "RDbl",
  };

  function showConfirmPane() {
    return (
      <table>
        <thead>
          <tr>
            <td>Check your bid</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Your bid: {bid}</td>
          </tr>
          <tr>
            <td> AI says: {bidMap[aiBid] || aiBid}</td>
          </tr>
          <tr>
            <td>
              <button onClick={onRetryBid} className="btn-warning">
                Retry
              </button>
              <button onClick={onConfirmBid} className="btn-warning">
                Confirm Bid
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
  function showBiddingButtons(all = false) {
    let options = ["Pass"];
    if (doubleOption) options.push(bidMap[doubleOption]);
    !all && options.push("Skip");
    const minLevel = goingBid ? goingBid.charAt(0) - "0" : 1;

    return (
      <table>
        <tbody>
          <tr>
            {options.map((option, idx) => (
              <td key={idx} xs={3}>
                {getOptionButton(option, onPickBid, aiBid)}
              </td>
            ))}
          </tr>
          {[1, 2, 3, 4, 5, 6, 7].map((level) => (
            <tr key={level}>
              {(all || shouldShowBid(level, minLevel)) &&
                ["C", "D", "H", "S", "T"].map((suit) => {
                  return <td key={suit}>{getBidButton(level, suit)}</td>;
                })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  function shouldShowBid(level, minLevel) {
    return level >= minLevel && level <= minLevel + 1;
  }

  function getOptionButton(option, onPickBid, aiBid) {
    return (
      <button
        key={option}
        onClick={(event) => onPickBid(event, aiBid)}
        className="btn-secondary btn-sm "
        value={option}
      >
        {option}
      </button>
    );
  }

  function getBidButton(level, suit) {
    return level + suit <= goingBid ? (
      <button disabled className="btn-light btn-sm">
        {bidMap[level + suit] || (
          <h6>
            {level} <SuitImage suit={suit} />
          </h6>
        )}
      </button>
    ) : (
      <button
        onClick={(event) => onPickBid(event, aiBid)}
        className="btn-primary  btn-sm "
        value={level + suit}
      >
        {bidMap[level + suit] || (
          <h6>
            {level} <SuitImage suit={suit} />
          </h6>
        )}
      </button>
    );
  }

  function showUndoOption() {
    return (
      <React.Fragment>
        {allowUndo && <UndoBid onUndoBid={onUndoBid} />}
      </React.Fragment>
    );
  }
  function showBiddingPane(all) {
    return (
      <React.Fragment>
        <div>{showBiddingButtons(all)}</div>
        <div>{showUndoOption()}</div>
      </React.Fragment>
    );
  }

  if (!bid) return showBiddingPane(false);
  if (bid === "Skip") return showBiddingPane(true);
  return showConfirmPane();
};

export default BidBox;
