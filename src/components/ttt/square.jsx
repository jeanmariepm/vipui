import React, { Component } from "react";

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: props.game,
      handler: props.onClick,
      index: props.index,
    };
  }

  getDisabled() {
    const value = this.getValue();
    return value === null ? false : true;
  }
  getValue() {
    return this.state.game.squares[this.state.index];
  }
  styles = {
    backgroundColor: "blue",
    fontSize: 14,
    width: 50,
    height: 50,
    margin: 2,
    borderRadius: 4,
  };
  render() {
    return (
      <button
        style={this.styles}
        disabled={this.getDisabled()}
        onClick={() => this.state.handler()}
      >
        <strong>{this.getValue()}</strong>
      </button>
    );
  }
}
export default Square;
