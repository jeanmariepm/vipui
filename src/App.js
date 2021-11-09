import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import Home from './components/nav/home'
import Deals from "./components/bridge/deals";
import Bridge from './components/bridge/bridge'
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
    console.log('App got from getCurrentUser:', user)
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    console.log('App:', user)

    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container">
          <Switch>
            <Route path="/register" component={RegisterForm} />
            <Route path="/login" component={LoginForm} />
            <Route path="/logout" component={Logout} />
            <Route path="/home"
              render={props => <Home {...props} user={user} />}
            />
            <Route path="/deals" component={Deals} />
            <Route path="/bridge" component={Bridge} />
            <Route path="/tictactoe" component={TicTacToe} />
            <Route path="/not-found" component={NotFound} />
            <Redirect to="/not-found" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
