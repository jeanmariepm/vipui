import React from "react";
import UndoBid from "./undoBid";
import auth from "../../services/authService";
import { ListGroup, ListGroupItem, Button } from "react-bootstrap";

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
      <ListGroup>
        <ListGroupItem>
          {undoBid && <UndoBid onUndoBid={undoBid} />}
        </ListGroupItem>
        {practiceMode && (
          <React.Fragment>
            <ListGroupItem>
              <Button className="btn-primary" onClick={nextDeal}>
                Next Deal
              </Button>
            </ListGroupItem>
            <ListGroupItem>
              {username && (
                <Button className="btn-warning" onClick={saveDeal}>
                  Save Deal
                </Button>
              )}
              {!username && <p>Login to Save </p>}
            </ListGroupItem>
          </React.Fragment>
        )}
        {!practiceMode && (
          <ListGroupItem>
            <Button className="btn-success" size="sm" onClick={doneDeal}>
              Back
            </Button>
          </ListGroupItem>
        )}
      </ListGroup>
    );
  };
  return <React.Fragment>{showNextPane()}</React.Fragment>;
};

export default DealControl;
