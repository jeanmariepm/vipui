import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import Home from "./components/nav/home";
import Deals from "./components/bridge/deals";
import Bridge from "./components/bridge/bridge";
import TicTacToe from "./components/ttt/tictactoe";
import NotFound from "./components/nav/notFound";
import NavBar from "./components/nav/navBar";
import LoginForm from "./components/nav/loginForm";
import RegisterForm from "./components/nav/registerForm";
import Logout from "./components/nav/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import auth from "./services/authService";
import "./App.css";

class App extends Component {
  state = {};

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  render() {
    const { user } = this.state;

    return (
      <React.Fragment>
        <ToastContainer position="top-right" />
        <NavBar user={user} />
        <main className="container">
          <Switch>
            <Route path="/register" component={RegisterForm} />
            <Route path="/login" component={LoginForm} />
            <Route path="/logout" component={Logout} />
            <Route
              path="/home"
              render={(props) => <Home {...props} user={user} />}
            />
            <Route path="/deals" component={Deals} />
            <Route path="/bridge" component={Bridge} />
            <Route path="/tictactoe" component={TicTacToe} />
            <Redirect to="/home" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
