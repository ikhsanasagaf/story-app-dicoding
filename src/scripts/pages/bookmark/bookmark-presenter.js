export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showBookmarkedStories() {
    try {
      const stories = await this.#model.getAllStories();
      if (!stories.length) {
        this.#view.showEmptyBookmark();
      } else {
        this.#view.showBookmarkedStories(stories);
      }
    } catch (error) {
      this.#view.showBookmarkError("Failed to load bookmarked stories.");
    }
  }
}
