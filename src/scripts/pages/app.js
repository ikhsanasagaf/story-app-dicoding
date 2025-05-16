import routes from "../routes/routes";
import { getAccessToken, getLogout } from "../utils/auth";
import { transitionHelper, isServiceWorkerAvailable } from "../utils";
import { getActiveRoute } from "../routes/url-parser";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";
import Swal from "sweetalert2";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
    this.#setupDrawer();
    this.#setupSkipToContent();
    this.#setupAuthButton();
  }

  #init() {
    this.renderPage();
  }

  #setupSkipToContent() {
    this.#skipLinkButton.addEventListener("click", () => {
      this.#content.focus();
    });
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupAuthButton() {
    const authButton = document.getElementById("auth-button");

    const updateAuthButtonText = () => {
      const token = getAccessToken();
      authButton.textContent = token ? "Logout" : "Login";
    };

    // Set initial button text
    updateAuthButtonText();

    authButton.addEventListener("click", () => {
      const token = getAccessToken();
      if (token) {
        // Show confirmation dialog before logging out
        const confirmLogout = Swal.fire({
          title: "Are you sure?",
          text: "Do you want to log out?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, log out",
          cancelButtonText: "No, stay logged in",
        }).then((result) => {
          if (result.isConfirmed) {
            // Logout logic
            getLogout();
            // Show success message
            Swal.fire({
              title: "Logged out",
              text: "You have been logged out successfully.",
              icon: "success",
              confirmButtonText: "OK",
            });
            window.location.hash = "#/login";
            updateAuthButtonText();
          }
        });
      } else {
        // Redirect to login page
        window.location.hash = "#/login";
      }

      // Update button text after login/logout
      updateAuthButtonText();
    });
  }

  async #setupPushNotification() {
    const container = document.getElementById("notification-btn-container");
    if (!container) return;

    // Clear previous button(s)
    container.innerHTML = "";

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      // Unsubscribe button
      const unsubBtn = document.createElement("button");
      unsubBtn.id = "unsubscribe-notify-btn";
      unsubBtn.className = "btn btn-outline";
      unsubBtn.innerHTML = `<i class="fa-solid fa-bell-slash" style="margin-right:5px;"></i> Unsubscribe from Notifications`;
      unsubBtn.addEventListener("click", () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
      container.appendChild(unsubBtn);
    } else {
      // Subscribe button
      const subBtn = document.createElement("button");
      subBtn.id = "subscribe-notify-btn";
      subBtn.className = "btn btn-outline";
      subBtn.innerHTML = `<i class="fa-solid fa-bell" style="margin-right:5px;"></i> Subscribe to Notifications`;
      subBtn.addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
      container.appendChild(subBtn);
    }
  }

  async renderPage() {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = "flex";

    const token = getAccessToken();
    const url = getActiveRoute();

    // Define restricted routes
    const restrictedRoutes = ["/", "/add-stories"];

    // Redirect to login if the user is not authenticated and tries to access a restricted route
    if (!token && restrictedRoutes.includes(url)) {
      Swal.fire({
        title: "Access Denied",
        text: "You need to log in to access this page.",
        icon: "error",
        confirmButtonText: "OK",
      });
      window.location.hash = "#/login";
      spinner.style.display = "none";
      return;
    }

    // Update the auth button text dynamically
    const authButton = document.getElementById("auth-button");
    if (authButton) {
      authButton.textContent = token ? "Logout" : "Login";
    }

    const page = routes[url] || routes["/404"];

    // Use transitionHelper for animations
    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    // Handle errors and animations
    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      spinner.style.display = "none";

      if (isServiceWorkerAvailable()) {
        const container = document.getElementById("notification-btn-container");
        container.innerHTML = "";
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
