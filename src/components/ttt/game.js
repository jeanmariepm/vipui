class Game {
  constructor() {
    this.squares = Array(9).fill(null);
  }

  getWinner() {
    return this.calculateWinner(this.squares);
  }

  isOver() {
    if (this.squares.filter((s) => s === null).length === 0) {
      return true;
    } else {
      return false;
    }
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] !== null &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        //console.log("Found a winner:", squares[a], squares);
        return squares[a];
      }
    }
    return null;
  }

  setAction(player, action) {
    this.squares[action] = player;
  }

  getAIAction() {
    // return center or top-left in first AI move
    if (this.squares.filter((s) => s === "X").length === 1) {
      if (!this.squares[4]) {
        return 4;
      } else if (!this.squares[0]) {
        return 0;
      }
    }
    // use minmax algorithm
    // find action with least value by choosing opp's action with highest value

    let [, action] = this.minmax(this.squares, "O");
    if (action === -1) {
      console.log("giving up?");
      action = this.squares.findIndex((s) => s === null);
    }
    return action;
  }

  bestVal = { X: 1, O: -1 };
  getWinningMove(squares, player) {
    let sq = [...squares];
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        sq[i] = player;
        const winner = this.calculateWinner(sq);
        sq[i] = squares[i];
        if (winner === player) {
          return [this.bestVal[player], i];
        }
      }
    }

    return [null, null];
  }

  minmax(squares, player, depth = 0) {
    //console.log(`${"*".repeat(depth)} minmax exploring ${squares} ${player}`);
    const nextPlayer = player === "X" ? "O" : "X";

    // no empty squares => game is tied
    let gameOver = true;
    for (let i = 0; i < squares.length; i++) if (!squares[i]) gameOver = false;
    if (gameOver) return [0, -1];

    // see if there's an immediate winning move
    let [nextVal, action] = this.getWinningMove(squares, player);
    if (nextVal === this.bestVal[player]) return [nextVal, action];

    // pick the best remaining option
    let sq = [...squares];
    let [lossVal, lossAction] = [this.bestVal[nextPlayer], -1];
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        sq[i] = player;
        depth < 0 &&
          console.log(
            `${"*".repeat(depth)} minmax considering ${i} for ${player}`
          );
        [nextVal, action] = this.minmax(sq, nextPlayer, depth + 1);
        depth < 0 &&
          console.log(
            `${"*".repeat(
              depth
            )} minmax considered ${i} for ${player} and got ${nextVal},${action}`
          );
        sq[i] = squares[i];
        if (nextVal === this.bestVal[player]) return [nextVal, i];
        if (nextVal === 0) [lossVal, lossAction] = [nextVal, i];
      }
    }
    // we have a tie if we are here
    return [lossVal, lossAction];
  }
}

export default Game;
