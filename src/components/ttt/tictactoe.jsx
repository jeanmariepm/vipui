import React, { Component } from "react";
import Square from "./square";
import Game from "./game";
import { Container } from "react-bootstrap";

class TicTacToe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Game(),
    };
  }

  startOver = () => {
    this.setState({
      game: new Game(),
    });
  };

  renderSquare(i) {
    return (
      <Square
        game={this.state.game}
        index={i}
        onClick={() => this.clickHandler(i)}
      />
    );
  }

  clickHandler(i) {
    this.state.game.setAction("X", i);

    // const game = { ...this.state.gane };
    if (this.state.game.getWinner()) {
      console.log(`Disabling clickHandler as we have a winners `);
    } else {
      const action = this.state.game.getAIAction();
      console.log(`AI recommends: ${action}`);
      this.state.game.setAction("O", action);
    }
    this.setState({
      game: this.state.game,
    });
  }

  renderWinnerScreen(winner) {
    return (
      <div className="App">
        <div id="winner">{winner} won!</div>
        <button className="btn-secondary" onClick={this.startOver}>
          Start Over
        </button>
      </div>
    );
  }

  render() {
    let winner;
    if (this.state.game.isOver()) {
      winner = "Nobody";
    } else if (this.state.game.getWinner()) {
      winner = this.state.game.getWinner();
    }
    if (winner) {
      return this.renderWinnerScreen(winner);
    }
    return this.renderGameScreen();
  }

  renderGameScreen() {
    return (
      <React.Fragment>
        <div>
          <h1>Tic Tac Toe</h1>
        </div>
        <div className="BoardSquare">
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default TicTacToe;
