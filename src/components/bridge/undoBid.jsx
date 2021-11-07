import React from "react";

const UndoBid = ({ onUndoBid }) => {
  return (
    <button className="btn-warning" onClick={onUndoBid}>
      Undo last bid
    </button>
  );
};

export default UndoBid;
