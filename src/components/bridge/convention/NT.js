import _ from "lodash";

const getOpening = (agent) => {
  if (agent.shape === "U")
    // unbalaced
    return "";
  if (_.inRange(agent.totalPoints, 15, 18)) return "1T";
  if (_.inRange(agent.totalPoints, 20, 22)) return "2T";

  return "";
};

const getOvercall = (bids, biddingContext, agent) => {
  let aiBid = "";
  const { goingBid } = biddingContext;
  const level = goingBid.charAt(0) - "0";
  for (let suit of biddingContext.oppSuits) {
    if (suit === "T") return "";
    if (!agent.haveStopper(suit)) return "";
  }
  if (agent.shape === "B" && agent.totalPoints >= 18)
    return level === 3 ? "3T" : level <= 2 ? "X" : "";
  if (agent.shape === "B" && agent.totalPoints >= 15)
    return level === 1 ? "1T" : level === 2 ? "2T" : "";
  return aiBid;
};

const getResponse = (bids, biddingContext, agent) => {
  const rhoBid = bids[bids.length - 1];
  const { goingBid } = biddingContext;
  const level = goingBid.charAt(0) - "0";
  const suit = goingBid.charAt(1);

  if (!["P", "X", "2C"].includes(rhoBid))
    if (agent.totalPoints >= 10) {
      if (agent.longestLength > 5 && rhoBid < "4S")
        if (agent.longestSuit > suit) return level + agent.longestSuit;
        else return level + 1 + agent.longestSuit;
      else return "X";
    } else return "";

  // Jacoby or Smolen
  if (
    agent.spadeLength === 5 &&
    _.inRange(agent.totalPoints, 8, 10) &&
    level === 1
  )
    return rhoBid === "2C" ? "X" : "2C"; //use Stayman to invite with a 5-cd Spade
  if (agent.spadeLength >= 5 && agent.heartLength < 4) return level + 1 + "H";
  if (agent.heartLength >= 5 && agent.spadeLength < 4) return level + 1 + "D";
  if (agent.spadeLength >= 5 && agent.heartLength >= 5) {
    if (level === 1) {
      return agent.totalPoints >= 10 ? "2H" : "2D";
    } else {
      return agent.totalPoints >= 4 ? "3H" : "3D";
    }
  }
  if (
    agent.spadeLength >= 4 &&
    agent.heartLength >= 4 &&
    agent.spadeLength + agent.heartLength === 9
  ) {
    if (agent.totalPoints >= 10 && level === 1) return "2C"; //Smolen
    if (agent.totalPoints >= 4 && level === 2) return "3C"; //Smolen
    return agent.longestSuit === "S" ? level + 1 + "H" : level + 1 + "D";
  }

  // Stayman with 4-cd major
  if (agent.spadeLength === 4 || agent.heartLength === 4) {
    if (level === 1)
      if (
        agent.totalPoints >= 10 &&
        agent.spadeLength + agent.heartLength !== 7
      )
        return rhoBid === "2C" ? "X" : "2C";
      //use Stayman to invite with a 5-cd Spade
      else if (agent.totalPoints >= 8) return "2C";
    if (level === 2 && agent.totalPoints >= 4) return "3C";
  }

  // GF 3145 or 2155 or 3-cd major
  if (level === 1 && agent.totalPoints >= 10) {
    if (
      agent.spadeLength === 1 &&
      agent.heartLength === 3 &&
      agent.longestLength === 5
    )
      return "3S";
    if (
      agent.spadeLength === 3 &&
      agent.heartLength === 1 &&
      agent.longestLength === 5
    )
      return "3H";
    if (agent.spadeLength >= 3 || agent.heartLength >= 3) return "3C";
    if (agent.clubLength === 5 && agent.diamondLength === 5) return "3D";
  }

  //Size ask with an invitational hand
  if (level === 1 && _.inRange(agent.totalPoints, 8, 10)) return "2S";

  // Minor suit transfer
  if (level === 1 && agent.ltc <= 9) {
    if (agent.clubLength >= 6) return "2S";
    if (agent.diamondLength >= 6) return "2T";
  }

  // GF balanced
  const adjustedtotalPoints = agent.totalPoints;
  if (level === 1) {
    if (10 <= adjustedtotalPoints <= 15) return "3T";
    if (16 <= adjustedtotalPoints <= 17) return "4T";
    if (18 <= adjustedtotalPoints <= 19) return "6T";
    if (20 <= adjustedtotalPoints <= 21) return "2S";
    if (22 <= adjustedtotalPoints) return "7T";
  } else if (level === 2) {
    if (5 <= adjustedtotalPoints <= 11) return "3T";
    if (12 <= adjustedtotalPoints) return "4T";
    if (13 <= adjustedtotalPoints <= 15) return "6T";
    if (16 <= adjustedtotalPoints) return "3S";
    if (17 <= adjustedtotalPoints) return "7T";
  }

  return "P";
};

const getOpenerRebid = (bids, biddingContext, agent) => {
  const openingBid = bids[bids.length - 4];
  const pdBid = bids[bids.length - 2];
  const pdSuit = pdBid.charAt(1);
  const { spadeLength, heartLength, diamondLength, clubLength } = agent;
  const maxHand = agent.totalPoints >= 16;
  let aiBid = "";

  if (openingBid === "1T") {
    if (pdBid === "2C")
      aiBid = heartLength >= 4 ? "2H" : spadeLength >= 4 ? "2S" : "2D";
    if (!aiBid && pdBid <= "2H") aiBid = pdSuit === "D" ? "2H" : "2S";
    if (pdBid === "2S") aiBid = maxHand ? "3C" : "2T";
    if (pdBid === "2T") aiBid = maxHand && diamondLength >= 2 ? "3D" : "3C";
    if (pdBid === "3C") {
      aiBid =
        heartLength >= 5
          ? "3H"
          : spadeLength >= 5
          ? "3S"
          : heartLength >= 4 || spadeLength >= 4
          ? "3D"
          : "3T";
    }
    if (pdBid === "3D") {
      if (agent.haveStopper("H") && agent.haveStopper("S")) aiBid = "3T";
      else
        aiBid =
          heartLength >= 5
            ? "3H"
            : spadeLength >= 5
            ? "3S"
            : diamondLength > clubLength
            ? "4D"
            : "4C";
    }
    if (pdBid === "3H") {
      if (spadeLength >= 3) aiBid = "3S";
      else if (agent.haveStopper("H")) aiBid = "3T";
      else aiBid = diamondLength > clubLength ? "4D" : "4C";
    }
    if (pdBid === "3S") {
      if (spadeLength >= 3) aiBid = "4H";
      else if (agent.haveStopper("S")) aiBid = "3T";
      else aiBid = diamondLength > clubLength ? "4D" : "4C";
    }
  } else {
    //opening bid was 2T
    if (pdBid === "3C")
      aiBid = heartLength >= 4 ? "3H" : spadeLength >= 4 ? "3S" : "3D";
    if (!aiBid && pdBid <= "3H") aiBid = pdSuit === "D" ? "3H" : "3S";
    if (pdBid === "3S") {
      aiBid = diamondLength <= clubLength && clubLength >= 4 ? "4C" : "";
      if (!aiBid) aiBid = diamondLength >= 4 ? "4D" : "3T";
    }
  }
  if (["3T", "6T", "7T"].includes(pdBid)) aiBid = "P";
  if (pdBid === "4T") aiBid = maxHand ? "6T" : "P";

  return aiBid;
};

const getResponderRebid = (bids, biddingContext, agent) => {
  //pass with intervention after NT bid response
  for (let i = bids.length - 1; i >= bids.length - 4; i -= 2) {
    if (bids[i] !== "P") return "";
  }
  const { spadeLength, heartLength, diamondLength, clubLength } = agent;

  const pdBid = bids[bids.length - 2];
  const pdLevel = pdBid.charAt(0) - "0";
  const pdSuit = pdBid.charAt(1);
  const prevBid = bids[bids.length - 4];
  const prevSuit = prevBid.charAt(1);

  // pass game and slam bids
  if (["3T", "4H", "4S", "5C", "5D"].includes(pdBid)) return "P";
  if (pdLevel >= 6) return "P";

  // Stayman rebids
  if (prevSuit === "C") {
    // garbage
    if (pdLevel === 2 && agent.totalPoints < 8) return "P";
    if (pdLevel === 3 && agent.totalPoints < 4) return "P";

    if (
      (pdLevel === 2 && agent.totalPoints >= 10) ||
      (pdLevel === 3 && agent.totalPoints >= 4)
    ) {
      //GF hands
      if (pdSuit === "D" && spadeLength + heartLength === 9) {
        //Smolen
        return spadeLength === 5 ? "3H" : "3S";
      }
      if (pdSuit === "H") return heartLength >= 4 ? "4H" : "3T";
      if (pdSuit === "S") return spadeLength >= 4 ? "4S" : "3T";
    }
    if (pdLevel === 2 && agent.totalPoints >= 8) {
      // inv hands
      if (pdSuit === "D") return spadeLength === 5 ? "2S" : "2T";
      if (pdSuit === "H")
        return heartLength >= 4 ? "3H" : spadeLength === 5 ? "2S" : "2T";
      if (pdSuit === "S") return spadeLength >= 4 ? "3S" : "2T";
    }
  }

  //Jacoby rebids
  if (["D", "H"].includes(prevSuit)) {
    if (
      (pdLevel === 2 && agent.totalPoints >= 10) ||
      (pdLevel === 3 && agent.totalPoints >= 4)
    ) {
      //GF hands
      if (pdSuit === "H" && heartLength > 5) return "4H";
      if (pdSuit === "S" && spadeLength > 5) return "4S";
      return "3T";
    }
    if (pdLevel === 2 && agent.totalPoints >= 8) {
      if (pdSuit === "H" && heartLength > 5) return "3H";
      if (pdSuit === "S" && spadeLength > 5) return "3S";
      return "2T";
    }
    return "P";
  }

  return "";
};

const NT = {
  getOpening,
  getOvercall,
  getResponse,
  getOpenerRebid,
  getResponderRebid,
};

export default NT;
