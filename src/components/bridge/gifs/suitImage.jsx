import React from "react";
import S from "./s.gif";
import H from "./h.gif";
import D from "./d.gif";
import C from "./c.gif";

const images = { S, H, D, C };
const SuitImage = ({ suit }) => (
  <React.Fragment>
    <img src={images[suit]} alt={suit} />
  </React.Fragment>
);

export default SuitImage;
