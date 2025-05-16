import AboutPresenter from './about-presenter.js';

export default class AboutPage {
  #presenter;

  async render() {
    return `
      <section class="about-page container">
        <div class="about-page__content">
          <h1 class="about-page__title"></h1>
          <div id="about-sections"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AboutPresenter({ view: this });
    await this.#presenter.loadAboutContent();
  }

  renderAboutContent({ title, sections }) {
    // Set the title
    document.querySelector('.about-page__title').innerHTML = `<i class="fas fa-book-reader"></i> ${title}`;

    // Render the sections
    const sectionsContainer = document.getElementById('about-sections');
    sectionsContainer.innerHTML = sections
      .map(
        (section) => `
        <p class="about-page__description">
          <i class="${section.icon}"></i> ${section.text}
        </p>
      `
      )
      .join('');
  }
}
