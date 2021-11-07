import _ from "lodash";
import NT from "./convention/NT";
import Minors from "./convention/minors";
import Majors from "./convention/majors";

class Agent {
  constructor(hand) {
    this.hand = hand;
    this.hcp = 0;
    this.ltc = 0;
    this.shape = "";
    this.distribution = [];
    this.evaluateHand();
    const {
      longestLength,
      longestSuit,
      secondLength,
      secondSuit,
    } = this.getTwoLongest();
    this.longestLength = longestLength;
    this.longestSuit = longestSuit;
    this.secondLength = secondLength;
    this.secondSuit = secondSuit;
    this.totalPoints = this.hcp;
    if (longestLength > 4 && hand[longestSuit].match("A|K|Q"))
      this.totalPoints += longestLength - 4;
    if (secondLength > 4 && hand[secondSuit].match("A|K|Q"))
      this.totalPoints += secondLength - 4;

    this.spadeLength = this.distribution[0];
    this.heartLength = this.distribution[1];
    this.diamondLength = this.distribution[2];
    this.clubLength = this.distribution[3];
  }
  print() {
    console.log(
      this.hand,
      ` ${this.hcp} ${this.totalPoints} Dist:${this.distribution} LTC:${this.ltc} Shape:${this.shape}`
    );
  }
  evaluateHand() {
    for (const suit in this.hand) {
      const cards = this.hand[suit];
      this.hcp += cards.search("A") >= 0 ? 4 : 0;
      this.hcp += cards.search("K") >= 0 ? 3 : 0;
      this.hcp += cards.search("Q") >= 0 ? 2 : 0;
      this.hcp += cards.search("J") >= 0 ? 1 : 0;
      this.distribution.push(cards.length);
      let ltcCards =
        cards.length >= 3
          ? cards.replace("A", "").replace("K", "").replace("Q", "")
          : cards.length === 2
          ? cards.replace("A", "").replace("K", "")
          : cards.replace("A", "");
      this.ltc += Math.min(3, cards.length) - (cards.length - ltcCards.length);
    }
    const shapeLengths = _.groupBy(this.distribution);
    this.shape =
      shapeLengths[0] || shapeLengths[1]
        ? "U"
        : shapeLengths[2] && shapeLengths[2].length > 1
        ? "S"
        : "B";
  }
  goodToOvercall(suit) {
    const cards = this.hand[suit];
    let topCards = 0;
    if (cards.search("A") >= 0) topCards++;
    if (cards.search("K") >= 0) topCards++;
    if (cards.search("Q") >= 0) topCards++;
    if (cards.search("J") >= 0 && cards.search("T") >= 0) topCards++;
    return cards.length >= 5 && topCards >= 2;
  }

  haveStopper(suit) {
    const cards = this.hand[suit];
    if (cards.search("A") >= 0) return true;
    if (cards.search("K") >= 0 && cards.length >= 2) return true;
    if (cards.length === 3) {
      if (
        cards.charAt(0) === "Q" &&
        (cards.charAt(1) === "J" || cards.charAt(1) === "T")
      )
        return true;
    }
    if (cards.length >= 4) return true;
    return false;
  }

  getTwoLongest() {
    const longestLength = _.max(this.distribution);
    const longestIndex = _.indexOf(this.distribution, longestLength);
    const longestSuit = this.suitMap[longestIndex];
    const remainingDist = [...this.distribution];
    remainingDist[longestIndex] = 0;
    const secondLength = _.max(remainingDist);
    const secondIndex = _.indexOf(remainingDist, secondLength);
    const secondSuit = this.suitMap[secondIndex];
    return { longestLength, longestSuit, secondLength, secondSuit };
  }

  getGoingBid(bids) {
    let bid;
    let dblRdbl = "";
    for (let i = bids.length - 1; i >= 0; i--) {
      bid = bids[i];
      if (bid === "X" && !dblRdbl) dblRdbl = "X";
      if (bid === "XX" && !dblRdbl) dblRdbl = "XX";
      if (bid.match(/^\d/)) return [i, bid, dblRdbl];
    }
    return [-1, "", ""];
  }

  getBidderRoles(bids) {
    let bidderRole, pdRole;

    if (bids.length === 0) bidderRole = "Opener";
    else if (bids.length === 1) {
      bidderRole = bids[0] === "P" ? "Opener" : "Overcaller";
    }
    if (bidderRole) return [bidderRole, pdRole];

    console.assert(bids.length > 1);

    [pdRole] = this.getBidderRoles(bids.slice(0, bids.length - 2));
    if (pdRole === "Opener" || pdRole === "Overcaller") {
      bidderRole =
        bids[bids.length - 2] === "P"
          ? bids[bids.length - 1] === "P"
            ? pdRole
            : "Overcaller"
          : pdRole === "Opener"
          ? "Responder"
          : "Advancer";
    } else if (pdRole === "Responder" || pdRole === "Advancer") {
      bidderRole = "OpenerRebid";
    } else if (pdRole === "OpenerRebid") bidderRole = "ResponderRebid";
    return [bidderRole, pdRole];
  }

  getBiddingContext(bids) {
    const [gb, goingBid, dblRdbl] = this.getGoingBid(bids);
    const [pgb, priorGoingBid, priorDblRdbl] = goingBid
      ? this.getGoingBid(bids.slice(0, gb))
      : [-1, "", ""];
    const biddingContext = {
      bidderRole: null,
      pdRole: null,
      oppSuits: null,
      goingBid,
      priorGoingBid,
      dblRdbl,
      priorDblRdbl,
    };

    console.assert(pgb >= -1);
    const [bidderRole, pdRole] = this.getBidderRoles(bids);
    biddingContext.bidderRole = bidderRole;
    biddingContext.pdRole = pdRole;
    biddingContext.oppSuits = this.getOppSuits(bids);

    return biddingContext;
  }

  getOppSuits(bids) {
    let suits = new Set();
    for (let i = bids.length - 1; i >= 0; i = i - 2) {
      if (bids[i].match(/^\d/)) suits.add(bids[i].charAt(1));
    }
    return suits;
  }

  getBid(bids = []) {
    let aiBid = "";
    const bc = this.getBiddingContext(bids);
    if (bc.bidderRole === "Opener") aiBid = this.getOpeningBid();
    if (bc.bidderRole === "Overcaller") aiBid = this.getOvercall(bids, bc);
    if (bc.bidderRole === "Responder" || bc.bidderRole === "Advancer")
      aiBid = this.getResponse(bids, bc);
    if (bc.bidderRole === "OpenerRebid") aiBid = this.getOpenerRebid(bids, bc);
    if (bc.bidderRole === "ResponderRebid")
      aiBid = this.getResponderRebid(bids, bc);

    // console.log("aiBid:", aiBid);
    return aiBid;
  }
  getOpeningBid() {
    let aiBid = "";

    aiBid = NT.getOpening(this);
    if (!aiBid) aiBid = this.get2CBid();
    if (!aiBid) aiBid = Majors.getOpening(this);
    if (!aiBid) aiBid = Minors.getOpening(this);
    if (!aiBid) aiBid = this.getPreemptBid();
    if (!aiBid) aiBid = "P";
    // this.print();
    // console.log("Major?", aiBid);

    return aiBid;
  }

  getOvercall(bids, bc) {
    let aiBid = "";
    const suit = bc.goingBid.charAt(1);
    const level = bc.goingBid.charAt(0) - "0";
    const { pdRole } = bc;

    // no overcall over strong 2C
    if (pdRole && pdRole === "Opener" && bids[bids.length - 1] === "2C")
      return "P";
    if (pdRole && pdRole === "Overcaller" && bids[bids.length - 3] === "2C")
      return "P";

    aiBid = NT.getOvercall(bids, bc, this);
    if (!aiBid) aiBid = Majors.getOvercall(bids, bc, this); // handles minors as well
    if (!aiBid) aiBid = this.getTODouble(bids, bc, level, suit, bc.oppSuits);
    if (!aiBid)
      aiBid = this.getPreemptOvercall(level, bc.oppSuitssuit, bc.oppSuits);
    if (!aiBid) aiBid = "P";
    return aiBid;
  }
  getResponse(bids, bc) {
    let aiBid = "";
    const openingBid = bids[bids.length - 2];
    const suit = openingBid.charAt(1);
    const level = openingBid.charAt(0) - "0";

    if (suit === "T") aiBid = NT.getResponse(bids, bc, this);
    // console.log("NT response ", aiBid);

    if (!aiBid && level === 1 && ["S", "H"].includes(suit)) {
      aiBid = Majors.getResponse(bids, bc, this);
      // console.log("Major suit response ", aiBid);
    }

    if (!aiBid && level === 1 && ["D", "C"].includes(suit)) {
      aiBid = Minors.getResponse(bids, bc, this);
      // console.log("Minor suit response ", aiBid);
    }

    if (!aiBid) {
      aiBid = this.getResponseBid(bids, bc);
      // console.log("Other response ", aiBid);
    }

    return aiBid;
  }

  getOpenerRebid(bids, bc) {
    let aiBid = "";
    const openingBid = bids[bids.length - 4];
    const suit = openingBid.charAt(1);
    if (suit === "T") aiBid = NT.getOpenerRebid(bids, bc, this);

    if (!aiBid) {
      aiBid = Majors.getOpenerRebid(bids, bc, this);
    }

    if (!aiBid && ["D", "C"].includes(suit)) {
      aiBid = Minors.getOpenerRebid(bids, bc, this);
    }

    // TODO:  if (!aiBid) aiBid = getRebid(bid);

    return aiBid;
  }

  getResponderRebid(bids, bc) {
    let aiBid = "";
    const openingBid = bids[bids.length - 6];
    const suit = openingBid.charAt(1);

    if (suit === "T") aiBid = NT.getResponderRebid(bids, bc, this);
    if (!aiBid) {
      aiBid = Majors.getResponderRebid(bids, bc, this);
    }

    if (!aiBid && ["D", "C"].includes(suit)) {
      aiBid = Minors.getResponderRebid(bids, bc, this);
    }

    // TODO:  if (!aiBid) aiBid = getRebid(bid);

    return aiBid;
  }

  get2CBid = () => {
    if (this.hcp >= 21) return "2C";
    return "";
  };

  getPreemptBid = () => {
    if (this.ltc >= 9) return "";
    if (this.longestLength < 6) return "";

    if (this.longestLength === 6) {
      return this.spadeLength === 6
        ? "2S"
        : this.heartLength === 6
        ? "2H"
        : this.diamondLength === 6
        ? "2D"
        : "P";
    }
    if (this.longestLength > 6) {
      const suit =
        this.spadeLength > 6
          ? "S"
          : this.heartLength > 6
          ? "H"
          : this.diamondLength > 6
          ? "D"
          : "C";
      let level = 11 - this.ltc;
      if (level > 4) level = 4;
      return level + suit;
    }
    return "";
  };

  suitMap = { 0: "S", 1: "H", 2: "D", 3: "C" };

  getTODouble(bids, bc, level, suit, oppSuits) {
    if (this.hcp < 12) return "";
    if (this.hcp >= 18 + 2 * (level - 1)) return "X";

    if (suit === "T")
      if (NT.getOpening(bids, bc, this) === "1T" && level <= 2) return "X";
      else return "";

    const cards = this.hand[suit];
    const suits = ["S", "H", "D", "C"];

    if (cards.length >= 3) return "";
    for (let s in suits) {
      if (suits[s] !== suit && this.hand[suits[s]].length < 3) return "";
    }
    return "X";
  }
  getPreemptOvercall(level, suit, oppSuits) {
    let aiBid = this.getPreemptBid();
    if (aiBid && !oppSuits.has(aiBid.charAt(1)) && aiBid > level + suit)
      return aiBid;
    return "";
  }

  getResponseBid(bids, bc) {
    let aiBid = "";
    const bid = bids[bids.length - 2];

    if (bid === "2C") aiBid = this.get2CResponse(bids, bc);
    if (!aiBid) {
      if (bid.charAt(0) === "2") aiBid = this.getWeak2Response(bids, bc);
    }
    return aiBid;
  }

  get2CResponse(bids, bc) {
    const rhoBid = bids[bids.length - 1];
    if (rhoBid === "P") {
      if (this.hcp >= 5 && this.longestLength >= 5)
        return this.longestSuit === "C"
          ? "3C"
          : this.longestSuit === "D"
          ? "3D"
          : "2" + this.longestSuit;
      return "2D";
    }
    if (rhoBid === "X") {
      if (this.hcp >= 5 && this.longestLength >= 5)
        return this.longestSuit === "C" ? "3C" : "2" + this.longestSuit;
      if (this.hcp >= 3) return "XX";
      return "P";
    }

    // rho has bid a suit
    let aiBid = "";
    if (this.hcp >= 5 && this.longestLength >= 5)
      aiBid = this.longestSuit === "C" ? "3C" : "2" + this.longestSuit;
    if (aiBid && aiBid > rhoBid) return aiBid;
    if (this.hcp >= 3) return "X";
    return "P";
  }
  getWeak2Response(bids, bc) {
    const suit = bids[bids.length - 2].charAt(1);
    const rhoBid = bids[bids.length - 1];
    let aiBid = "";

    // first look to support the major
    const supportLength =
      suit === "S"
        ? this.spadeLength
        : suit === "H"
        ? this.heartLength
        : this.diamondLength;
    if (["S", "H"].includes(suit)) {
      if (this.totalPoints + supportLength >= 17) {
        aiBid = "4" + suit;
        if (["P", "X"].includes(rhoBid) || aiBid > rhoBid) return aiBid;
      }
    }

    // next try to bid your best suit
    if (
      this.hcp > 15 &&
      this.longestLength >= 5 &&
      ["S", "H"].includes(this.longestSuit)
    ) {
      aiBid = "2" + this.longestSuit;
      if (["P", "X"].includes(rhoBid) || aiBid > rhoBid) return aiBid;
      if (aiBid === rhoBid) return "X";
      if (this.hcp > 17 && this.longestLength >= 6)
        aiBid = "3" + this.longestSuit;
      if (aiBid > rhoBid) return aiBid;
      return "X";
    }

    // get more info or wait and see
    if (this.hcp > 15 && rhoBid === "P") return "2T";
    return "P";
  }
}

export default Agent;
