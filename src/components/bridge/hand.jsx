import React from "react";
import SuitImage from "./gifs/suitImage";

const Hand = ({ cards, name }) => {
  const suits = ["S", "H", "D", "C"];

  return (
    <React.Fragment>
      <h5>{name}</h5>
      {suits.map((suit) => {
        return (
          <h6 key={suit}>
            <SuitImage suit={suit} />
            {cards && cards[suit]}
            &nbsp;
          </h6>
        );
      })}
    </React.Fragment>
  );
};

export default Hand;
