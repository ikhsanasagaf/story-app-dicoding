import RegisterPresenter from "./register-presenter";
import * as StoriesAPI from "../../../data/api";
import Swal from "sweetalert2";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="auth-page container">
      <div class="auth-box">
        <h1 class="auth-page__title">Register</h1>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Enter your name" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" class="auth-form__button"><i class="fa-solid fa-user-plus" style="margin-right:7px; font-size:14px;"></i>Register</button>
        </form>
        <p class="auth-page__footer">
          Already have an account? <a href="#/login">Login here</a>
        </p>
      </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoriesAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    const registerForm = document.getElementById("register-form");
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  registeredSuccessfully(message) {
    Swal.fire({
      title: "Registration Successful",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.hash = "#/login";
    });
  }

  registeredFailed(message) {
    Swal.fire({
      title: "Registration Failed. Check your internet connection",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  showSubmitLoadingButton() {
    const button = document.querySelector(".auth-form__button");
    button.disabled = true;
    button.textContent = "Registering...";
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:7px; font-size:14px;"></i>Registering...`;
    button.style.cursor = "not-allowed";
  }

  hideSubmitLoadingButton() {
    const button = document.querySelector(".auth-form__button");
    button.disabled = false;
    button.textContent = "Register";
    button.innerHTML = `<i class="fa-solid fa-user-plus" style="margin-right:7px; font-size:14px;"></i>Register`;
    button.style.cursor = "pointer";
  }
}
