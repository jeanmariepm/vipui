import React from "react";
import Joi from "joi-browser";
import Form from "../common/form";
import auth from "../../services/authService";
import userService from "../../services/userService";
import { toast } from "react-toastify";

class RegisterForm extends Form {
  state = {
    data: { email: "", password: "", username: "" },
    errors: { email: "", password: "", username: "" },
  };

  schema = {
    email: Joi.string().required().email().label("Email"),
    password: Joi.string().required().min(8).label("Password"),
    username: Joi.string().required().min(6).label("Username"),
  };

  doSubmit = async () => {
    try {
      const { email, username, password } = this.state.data;
      let response = await userService.register(email, password, username);
      response = auth.login(username, password);
      window.location = "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = ex.response.data;
        console.warn(errors);
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Register</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("email", "Email")}
          {this.renderInput("password", "Password", "password")}
          {this.renderInput("username", "Username")}
          {this.renderButton("Register")}
        </form>
      </div>
    );
  }
}

export default RegisterForm;
