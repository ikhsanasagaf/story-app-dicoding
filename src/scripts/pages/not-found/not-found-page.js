export default class NotFoundPage {
  async render() {
    return `
      <section class="container">
        <h1 class="error-message" style="text-align:center;margin-top:40px;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right:10px;"></i>
          404 - Page Not Found
        </h1>
        <p style="text-align:center;">Sorry, the page you are looking for does not exist.</p>
        <div style="text-align:center;margin-top:30px;">
          <a href="#/" class="btn" style="text-decoration:none;">Back to Home</a>
        </div>
      </section>
    `;
  }

  async afterRender() {

  }
}