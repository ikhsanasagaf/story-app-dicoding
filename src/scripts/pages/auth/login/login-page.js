import LoginPresenter from "./login-presenter.js";
import * as StoriesAPI from "../../../data/api.js";
import * as AuthModel from "../../../utils/auth.js";
import Swal from "sweetalert2";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="auth-page container">
      <div class="auth-box">
        <h1 class="auth-page__title">Login</h1>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" class="auth-form__button">
            <i class="fa-solid fa-right-to-bracket" style="margin-right:7px;"></i> Login
          </button>
        </form>
        <p class="auth-page__footer">
          Don't have an account? <a href="#/register">Register here</a>
        </p>
      </div>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoriesAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };
        await this.#presenter.getLogin(data);
      });
  }

  loginSuccessfully(message) {
    console.log(message);
    Swal.fire({
      title: "Login Successful",
      text: "You have logged in successfully.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.hash = "#/";
    });
    window.location.hash = "#/";
  }

  loginFailed(message) {
    console.error("Login failed:", message);
    Swal.fire({
      title: "Login Failed",
      text: "The email or password you entered is incorrect. Or check your internet connection.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  showSubmitLoadingButton() {
    const submitButton = document.querySelector(".auth-form__button");
    submitButton.textContent = "Logging in...";
    submitButton.setAttribute("disabled", true);
    submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:7px; font-size:14px;"></i>Logging in...`;
    submitButton.style.cursor = "not-allowed";
  }

  hideSubmitLoadingButton() {
    const submitButton = document.querySelector(".auth-form__button");
    submitButton.textContent = "Login";
    submitButton.removeAttribute("disabled");
    submitButton.innerHTML = `<i class="fa-solid fa-right-to-bracket" style="margin-right:7px;"></i> Login`;
    submitButton.style.cursor = "pointer";
  }
}
