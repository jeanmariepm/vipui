import _ from "lodash";

const getOpening = (agent) => {
  if (agent.spadeLength < 5 && agent.heartLength < 5) return "";
  if (_.inRange(agent.totalPoints, 12, 22)) {
    return agent.spadeLength >= agent.heartLength ? "1S" : "1H";
  }
  return "";
};

const getOvercall = (bids, biddingContext, agent) => {
  const { goingBid, oppSuits } = biddingContext;
  const level = goingBid.charAt(0) - "0";
  const suit = goingBid.charAt(1);

  if (agent.totalPoints < 8 + 3 * (level - 1)) return "";

  if (
    !oppSuits.has(agent.longestSuit) &&
    agent.goodToOvercall(agent.longestSuit)
  ) {
    if (agent.totalPoints >= 17) return "X";
    if (level + agent.longestSuit > level + suit)
      return level + agent.longestSuit;
    return level + 1 + agent.longestSuit;
  } else if (
    !oppSuits.has(agent.secondSuit) &&
    agent.goodToOvercall(agent.secondSuit)
  ) {
    if (agent.totalPoints >= 17) return "X";
    if (level + agent.secondSuit > level + suit)
      return level + agent.secondSuit;
    return level + 1 + agent.secondSuit;
  }
  return "";
};

const getResponse = (bids, biddingContext, agent) => {
  const rhoBid = bids[bids.length - 1];
  const rhoLevel = rhoBid.match(/^\d/);
  const rhoSuit = rhoLevel ? rhoBid.charAt(1) : null;
  const { pdRole } = biddingContext;
  const pdBid = bids[bids.length - 2];
  const pdLevel = pdBid.charAt(0) - "0";
  const pdSuit = pdBid.charAt(1);
  const {
    longestSuit,
    longestLength,
    spadeLength,
    heartLength,
    diamondLength,
    clubLength,
  } = agent;
  const bidLevel = rhoSuit ? rhoLevel : pdLevel;
  const bidSuit = rhoSuit ? rhoSuit : pdSuit;
  let aiBid = "";
  const fit =
    (pdSuit === "C" && clubLength >= 5) ||
    (pdSuit === "D" && diamondLength >= 4) ||
    (pdSuit === "H" && heartLength >= 3) ||
    (pdSuit === "S" && spadeLength >= 3);

  if (agent.totalPoints < 5) return "P";
  if (fit) {
    if (pdRole === "Opener") {
      if (agent.ltc <= 9)
        aiBid = agent.ltc <= 7 ? "4" + pdSuit : 11 - agent.ltc + pdSuit;
      if (agent.ltc === 10)
        if (agent.totalPoints < 8) aiBid = "1T";
        else if (agent.totalPoints < 11) aiBid = "2" + pdSuit;

      if (aiBid > bidLevel + bidSuit) return aiBid;
      else return rhoSuit ? "X" : "P";
    } else {
      //pfRole === "Overcaller"
      if (agent.ltc <= 8) {
        aiBid = agent.ltc <= 6 ? "4" + pdSuit : 10 - agent.ltc + pdSuit;
        if (aiBid > bidLevel + bidSuit) return aiBid;
        else return rhoSuit ? "X" : "P";
      }
    }
  } else {
    // no major fit
    if (
      (pdRole === "Opener" && agent.totalPoints >= 12) ||
      (pdRole === "Overcaller" && agent.totalPoints >= 15)
    ) {
      // GF hands
      if (longestLength >= 5 && (!rhoSuit || rhoLevel <= 2)) {
        if (longestSuit > bidSuit) return bidLevel + longestSuit;
        return bidLevel + 1 + longestSuit;
      }
      if (rhoBid === "X") return "XX";
      if (longestSuit < 5 && !rhoSuit) return bidLevel + 1 + "C";
      if (rhoSuit && rhoLevel <= 3)
        return agent.haveStopper(rhoSuit) ? bidLevel + "T" : "X";
    } else if (agent.totalPoints >= 6) {
      aiBid = "";
      if (longestLength >= 5) {
        if (longestSuit > bidSuit) aiBid = bidLevel + longestSuit;
        if (longestSuit < bidSuit) aiBid = bidLevel + 1 + longestSuit;
        if (aiBid < "1T") return aiBid;
        if (
          aiBid < "2T" &&
          agent.totalPoints >= 10 &&
          longestSuit < pdSuit &&
          rhoSuit
        )
          return aiBid;
        if (aiBid && agent.totalPoints >= 8 && rhoSuit) return "X";
      }
      if (bidLevel === 1) {
        if (spadeLength >= 4) return "1S" > bidLevel + bidSuit ? "1S" : "P";
        if (rhoBid === "P" || agent.totalPoints >= 8)
          return "1T" > bidLevel + bidSuit ? "1T" : "P";
      }
    } else return "P";
  }
};

const getOpenerRebid = (bids, biddingContext, agent) => {
  const rhoBid = bids[bids.length - 1];
  const openingBid = bids[bids.length - 4];
  const openingSuit = openingBid.charAt(1);

  const pdBid = bids[bids.length - 2];
  const pdLevel = pdBid.charAt(0) - "0";
  const pdSuit = pdBid.charAt(1);
  const {
    secondSuit,
    secondLength,
    spadeLength,
    heartLength,
    diamondLength,
    clubLength,
  } = agent;
  let aiBid = "";

  if (rhoBid !== "P") return aiBid;

  if (pdLevel === 2 && pdSuit < openingSuit) {
    // 2 over 1 GF
    if (pdBid === "2H" && heartLength >= 3) return "3H";
    aiBid =
      openingSuit === "H" && heartLength >= 6
        ? "2H"
        : openingSuit === "S" && spadeLength >= 6
        ? "2S"
        : "";
    if (aiBid) return aiBid;
    if (secondLength >= 4) {
      return "2" + secondSuit > pdBid ? "2" + secondSuit : "3" + secondSuit;
    }
    return "2T";
  }
  if (["1T", "1S"].includes(pdBid)) {
    if (pdSuit === "S") {
      if (spadeLength >= 4) {
        let raiseLevel = 8 - agent.ltc;

        raiseLevel = raiseLevel > 4 ? 4 : raiseLevel < 2 ? 2 : raiseLevel;
        return raiseLevel + "S";
      }
      if (agent.shape === "B" && agent.totalPoints <= 17) return "1T";
    }
    if (agent.shape === "B" && agent.totalPoints <= 13) return "P";
    aiBid =
      openingSuit === "H" && heartLength >= 6
        ? "2H"
        : openingSuit === "S" && spadeLength >= 6
        ? "2S"
        : "";
    if (aiBid) return agent.totalPoints <= 17 ? aiBid : "3" + openingSuit;
    if (secondLength >= 4 && secondSuit < openingSuit)
      return agent.totalPoints <= 17 ? "2" + secondSuit : "3" + secondSuit;
    if (secondLength >= 4 && secondSuit === "S" && agent.totalPoints >= 17)
      return "2S";
    if (clubLength >= 2) return "2C";
    return "2D";
  }

  return aiBid;
};

const getResponderRebid = (bids, biddingContext, agent) => {
  //pass with intervention after response
  for (let i = bids.length - 1; i >= bids.length - 4; i -= 2) {
    if (bids[i] !== "P") return "";
  }
  const {
    spadeLength,
    heartLength,
    diamondLength,
    clubLength,
    longestSuit,
    longestLength,
  } = agent;

  const pdBid = bids[bids.length - 2];
  const pdLevel = pdBid.charAt(0) - "0";
  const pdSuit = pdBid.charAt(1);
  const prevBid = bids[bids.length - 4];
  const prevSuit = prevBid.charAt(1);
  const prevLevel = prevBid.charAt(0) - "0";

  const openingBid = bids[bids.length - 6];
  const openingSuit = openingBid.charAt(1);
  const openingLevel = openingBid.charAt(0) - "0";

  // pass game and slam bids
  if (["3T", "4H", "4S", "5C", "5D"].includes(pdBid)) return "P";
  if (pdLevel >= 6) return "P";
  let aiBid = "";

  if (prevLevel === 2 && prevSuit < openingSuit) {
    // 2 over 1 GF

    if (openingSuit === pdSuit) {
      //6-card suit
      if (pdSuit === "S" && spadeLength >= 2) return "3S";
      if (pdSuit === "H" && heartLength >= 2) return "3H";
      if (pdSuit === "D") {
        if (agent.haveStopper("H"))
          if (agent.haveStopper("S")) return "2T";
          else return "2H";
        if (agent.haveStopper("S")) return "2S";
        if (diamondLength >= 2) return "3D";
        else return "3C";
      }
    }
    if (pdBid === "2T") {
      if (openingSuit === "S" && spadeLength >= 3) return "3S";
      if (openingSuit === "H" && heartLength >= 3) return "3H";
      if (agent.secondLength >= 5) return "3" + agent.secondSuit;
      if (agent.shape !== "U" && agent.totalPoints <= 12) return "3T";
      if (agent.longestLength >= 6) return "3" + agent.longestSuit;
      if (agent.longestSuit !== prevSuit) return "3" + agent.longestSuit;
      return "3" + agent.secondSuit;
    } else {
      // new suit by partner
      let suitToBid;
      if (pdSuit === "S" && spadeLength >= 4) suitToBid = "S";
      if (pdSuit === "H" && heartLength >= 4) suitToBid = "H";
      if (!suitToBid && openingSuit === "S" && spadeLength >= 3)
        suitToBid = "S";
      if (!suitToBid && openingSuit === "H" && heartLength >= 3)
        suitToBid = "H";
      if (!suitToBid && agent.longestSuit !== prevSuit)
        suitToBid = agent.longestSuit;
      if (!suitToBid && agent.secondLength >= 4) suitToBid = agent.secondSuit;
      if (!suitToBid) suitToBid = "T";
      if (suitToBid > pdSuit) return pdLevel + suitToBid;
      else return pdLevel + 1 + suitToBid;
    }
  }
  if (prevLevel === 1 && prevSuit > openingSuit) {
    // previously responded at 1-level

    let majorFit = false;
    let minorFit = false;

    if (openingSuit === pdSuit) {
      //6-card suit
      if (pdSuit === "S" && spadeLength >= 2) majorFit = true;
      if (pdSuit === "H" && heartLength >= 2) majorFit = true;
      if (pdSuit === "D" && diamondLength >= 2) minorFit = true;
      if (pdSuit === "C" && clubLength >= 2) minorFit = true;
    } else if (pdSuit !== "T") {
      // opener has bid a new suit
      if (pdSuit === "S" && spadeLength >= 4) majorFit = true;
      if (pdSuit === "H" && heartLength >= 4) majorFit = true;
      if (pdSuit === "D" && diamondLength >= 4) minorFit = true;
      if (pdSuit === "C" && clubLength >= 4) minorFit = true;
    }
    if (majorFit) {
      let aiLevel = 0;
      if (agent.ltc <= 9) aiLevel = agent.ltc <= 7 ? 4 : 11 - agent.ltc;
      if (agent.ltc === 10) aiLevel = 2;
      aiLevel = aiLevel + pdLevel - 1;
      aiLevel = aiLevel > 4 ? 4 : aiLevel;
      return aiLevel > pdLevel ? aiLevel + pdSuit : "P";
    } else {
      if (pdBid < "2" + openingSuit)
        if (agent.totalPoints < 10) {
          // need to pass or correct
          const { pdSuitLength, openingSuitLength } = getPassCorrect(
            openingSuit,
            spadeLength,
            heartLength,
            diamondLength,
            clubLength,
            pdSuit
          );
          if (pdSuitLength > openingSuitLength) return "P";
          else return openingLevel + 1 + openingSuit;
        } else if (agent.totalPoints < 12) {
          if (longestLength >= 5 && ["S", "H"].includes(longestSuit)) {
            if (longestSuit < openingSuit) return "2" + longestSuit;
            // need to pass or correct
            const { pdSuitLength, openingSuitLength } = getPassCorrect(
              openingSuit,
              spadeLength,
              heartLength,
              diamondLength,
              clubLength,
              pdSuit
            );
            if (pdSuitLength > openingSuitLength) return "P";
            else return openingLevel + 1 + openingSuit;
          }
        } else {
          //GF hand
          if (longestLength >= 5) return "3" + longestSuit;
          else return "2T";
        }
    }
  }

  return "";
};

const Majors = {
  getOpening,
  getOvercall,
  getResponse,
  getOpenerRebid,
  getResponderRebid,
};

export default Majors;
function getPassCorrect(
  openingSuit,
  spadeLength,
  heartLength,
  diamondLength,
  clubLength,
  pdSuit
) {
  const openingSuitLength =
    openingSuit === "S"
      ? spadeLength
      : openingSuit === "H"
      ? heartLength
      : openingSuit === "D"
      ? diamondLength
      : clubLength;
  const pdSuitLength =
    pdSuit === "S"
      ? spadeLength
      : pdSuit === "H"
      ? heartLength
      : pdSuit === "D"
      ? diamondLength
      : clubLength;
  return { pdSuitLength, openingSuitLength };
}
