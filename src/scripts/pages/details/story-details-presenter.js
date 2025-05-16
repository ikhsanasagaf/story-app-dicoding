export default class StoryDetailsPresenter {
  #storyId;
  #view;
  #apiModel;

  constructor(storyId, { view, apiModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showStoryDetails() {
    this.#view.showStoryDetailsLoading();
    try {
      const response = await this.#apiModel.getStoryDetail(this.#storyId);

      if (!response.ok) {
        console.error("showStoryDetails: response:", response);
        this.#view.populateStoryDetailsError(response.message);
        return;
      }

      const story = response.story;
      console.log("showStoryDetails: story:", story);
      this.#view.populateStoryDetails(response.message, story);
    } catch (error) {
      console.error("showStoryDetails: error:", error);
      this.#view.populateStoryDetailsError(
        "An error occurred while loading the story details."
      );
      // Show offline fallback
      document.getElementById("story-details").innerHTML = `
      <div class="offline-fallback">
        <h2>Offline</h2>
        <p>This story is not available offline. Please connect to the internet.</p>
      </div>
    `;
    } finally {
      this.#view.hideStoryDetailsLoading();
    }
  }
}
