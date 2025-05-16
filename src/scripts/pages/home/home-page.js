import HomePresenter from "./home-presenter.js";
import * as StoriesAPI from "../../data/api.js";
import { initMap, addMarker } from "../../utils/map.js";
import { reverseGeocode } from "../../utils/geocode.js"; // Import reverse geocoding utility

export default class HomePage {
  #presenter;
  #map;

  async render() {
    return `
      <section class="home-page container">
        <div id="map-container" class="map-container"></div>
        <h1 class="home-page__title">Latest Stories</h1>
        <div id="notification-btn-container"></div>
        <div id="stories-list" class="stories-list"></div>
        <div id="loading-container" class="loading-container"></div>
        <button id="show-more-button" class="show-more-button">Show More</button>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });
    // Initialize the map
    this.#map = initMap("map-container");
    await this.#presenter.loadStories(true);

    // Add event listener for the "Show More" button
    const showMoreButton = document.getElementById("show-more-button");
    showMoreButton.addEventListener("click", async () => {
      await this.#presenter.loadStories();
    });
  }

  showLoading() {
    document.getElementById("loading-container").innerHTML =
      "<p>Loading stories...</p>";
  }

  hideLoading() {
    document.getElementById("loading-container").innerHTML = "";
  }

  showError(message) {
    document.getElementById(
      "stories-list"
    ).innerHTML = `<p class="error-message">${message}</p>`;
  }

  async appendStories(stories, clearExisting = false) {
    const storiesContainer = document.getElementById("stories-list");

    // Clear the container if `clearExisting` is true
    if (clearExisting) {
      storiesContainer.innerHTML = "";
    }

    stories.forEach((story) => {
      const date = new Date(story.createdAt);

      const formattedDate = `${date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })} ${date.getFullYear()}, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;

      const storyCard = document.createElement("div");
      storyCard.className = "story-card";
      storyCard.innerHTML = `
        <img class="story-card__image" src="${story.photoUrl}" alt="Photo of the story of '${story.name}'"/>
        <div class="story-card__content">
        <p class="story-card__date"><i class="fa-regular fa-clock" style="margin-right:6px;"></i>${formattedDate}</p>
        <p class="story-card__location" id="location-${story.id}"><i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Missing Location</p>
          <h2 class="story-card__title">${story.name}</h2>
          <p class="story-card__description">${story.description}</p>
          <button class="story-card__button" onclick="location.hash='#/stories/${story.id}'">
            <i class="fa-solid fa-eye" style="margin-right:7px;"></i>View Details
          </button>
        </div>
      `;

      storiesContainer.appendChild(storyCard);

      // Fetch location in the background
      if (story.lat && story.lon) {
        reverseGeocode(story.lat, story.lon)
          .then((location) => {
            const locationElement = document.getElementById(
              `location-${story.id}`
            );
            if (locationElement) {
              locationElement.innerHTML = `<i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>${location}`;
            }
            addMarker(
              [story.lat, story.lon],
              `<b>Story by ${story.name}</b><br>${story.description}`
            );
          })
          .catch((error) => {
            console.error("Failed to fetch location:", error);
            const locationElement = document.getElementById(
              `location-${story.id}`
            );
            if (locationElement) {
              locationElement.innerHTML = `<i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Unknown Location`;
            }
          });
      }
    });
  }

  hideShowMoreButton() {
    const showMoreButton = document.getElementById("show-more-button");
    showMoreButton.style.display = "none";
  }
}
