export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async submitStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);
      if (latitude && longitude) {
        formData.append("lat", latitude);
        formData.append("lon", longitude);
      }

      const response = await this.#model.storeNewStory(formData);
      
      if (!response.ok) {
        console.error("submitStory: response:", response);
        this.#view.showErrorMessage(response.message);
        return;
      }

      this.#view.showSuccessMessage("Story submitted successfully!");
      window.location.hash = "#/";
    } catch (error) {
      console.error("submitStory: error:", error);
      this.#view.showErrorMessage("An error occurred while submitting the story.");
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}