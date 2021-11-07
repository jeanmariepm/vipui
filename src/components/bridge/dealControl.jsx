import React from "react";
import UndoBid from "./undoBid";
import auth from "../../services/authService";

const DealControl = ({
  undoBid,
  saveDeal,
  nextDeal,
  doneDeal,
  practiceMode,
}) => {
  const showNextPane = () => {
    const username = auth.getCurrentUser();
    return (
      <React.Fragment>
        {undoBid && <UndoBid onUndoBid={undoBid} />}
        {practiceMode ? (
          <React.Fragment>
            <button className="btn-primary" onClick={nextDeal}>
              Next Deal
            </button>
            <button
              className="btn-warning"
              disabled={!username}
              onClick={saveDeal}
            >
              {!username ? "Login to Save" : "Save to Review"}
            </button>
          </React.Fragment>
        ) : (
          <button variant="success" size="sm" onClick={doneDeal}>
            Done
          </button>
        )}
      </React.Fragment>
    );
  };
  return <React.Fragment>{showNextPane()}</React.Fragment>;
};

export default DealControl;
