export default class HomePresenter {
  #view;
  #model;
  #currentPage = 1;
  #isLoading = false;
  #limit = 9;
  #location = 0;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadStories(clearExisting = false) {
    if (this.#isLoading) return;

    this.#isLoading = true;
    this.#view.showLoading();

    try {
      const response = await this.#model.getStories(this.#currentPage, this.#limit, this.#location);

      if (!response.ok) {
        console.error("loadStories: response:", response);
        this.#view.showError(response.message);
        return;
      }

      this.#view.appendStories(response.listStory.slice(0, this.#limit), clearExisting);
      this.#currentPage += 1;

      if (response.listStory.length < this.#limit) {
        this.#view.hideShowMoreButton();
      }
    } catch (error) {
      console.error("loadStories: error:", error);
      this.#view.showError("Failed to fetch stories. Please try again later.");
    } finally {
      this.#isLoading = false;
      this.#view.hideLoading();
    }
  }
}
