import StoryDetailsPresenter from "./story-details-presenter.js";
import * as StoriesAPI from "../../data/api.js";
import { reverseGeocode } from "../../utils/geocode.js";
import { initMap, addMarker } from "../../utils/map.js";
import Database from "../../data/database.js";
import Swal from "sweetalert2";

export default class StoryDetailsPage {
  #presenter = null;
  #story = null;

  async render() {
    return `
      <section>
        <div class="story-details__container">
          <div id="story-details" class="story-details"></div>
          <div id="story-details-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = location.hash.split("/").pop(); // Extract the story ID from the URL

    this.#presenter = new StoryDetailsPresenter(storyId, {
      view: this,
      apiModel: StoriesAPI,
    });

    this.#presenter.showStoryDetails();
  }

  populateStoryDetails(message, story) {
    this.#story = story;
    document.getElementById("story-details").innerHTML = `
      <div class="story-details-card">
        <div class="story-details__header">
          <h1 class="story-header">${story.name}'s Story Details</h1>
        </div>
        <img class="story-details__image" src="${
          story.photoUrl
        }" alt="Photo of the story by${story.name}" />
        <div class="story-details__content">
          <h1 class="story-details__title">Created by ${story.name}</h1>
          <p class="story-details__date">
            <i class="fa-regular fa-clock" style="margin-right:6px;"></i>Published on ${new Date(
              story.createdAt
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p class="story-details__location" id="story-location">
            <i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Loading location...
          </p>
          <hr class="story-details__divider" />
          <p class="story-details__description">${story.description}</p>
          <hr class="story-details__divider" />
          <div id="story-map" class="story-map"></div>
          <div id="bookmark-actions-container"></div>
          <button class="story-details__back-button" onclick="location.hash='#/'">
            <i class="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
    `;
    this.renderBookmarkButton();

    // Fetch and display the location
    if (story.lat && story.lon) {
      reverseGeocode(story.lat, story.lon)
        .then((location) => {
          const locationElement = document.getElementById("story-location");
          if (locationElement) {
            locationElement.innerHTML = `
            <i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>${location}
          `;
          }

          // Initialize the map and add a marker
          const map = initMap("story-map", [story.lat, story.lon], 13);
          addMarker(
            [story.lat, story.lon],
            `<b>${story.name}</b><br>${location}`
          );
        })
        .catch((error) => {
          console.error("Failed to fetch location:", error);
          const locationElement = document.getElementById("story-location");
          if (locationElement) {
            locationElement.innerHTML = `
            <i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Unknown Location
          `;
          }
        });
    } else {
      const locationElement = document.getElementById("story-location");
      if (locationElement) {
        locationElement.innerHTML = `
        <i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Location not available
      `;
      }
    }
  }

  populateStoryDetailsError(message) {
    document.getElementById("story-details").innerHTML = `
      <p class="error-message">${message}</p>
    `;
  }

  showStoryDetailsLoading() {
    document.getElementById("story-details-loading-container").innerHTML = `
      <p>Loading story details...</p>
    `;
  }

  hideStoryDetailsLoading() {
    document.getElementById("story-details-loading-container").innerHTML = "";
  }

  async renderBookmarkButton() {
    const container = document.getElementById("bookmark-actions-container");
    if (!container || !this.#story) return;

    const isBookmarked = await Database.getStoryById(this.#story.id);
    if (isBookmarked) {
      container.innerHTML = `
        <button id="remove-bookmark-btn" class="btn btn-outline">
          <i class="fa-solid fa-bookmark" style="margin-right:5px;"></i> Remove Bookmark
        </button>
      `;
      document.getElementById("remove-bookmark-btn").onclick = async () => {
        await Database.removeStory(this.#story.id);
        this.renderBookmarkButton();
        Swal.fire({
          icon: "success",
          title: "Bookmark Removed!",
          text: "This story has been removed from your bookmarks.",
          showConfirmButton: false,
          timer: 1500,
        });
      };
    } else {
      container.innerHTML = `
        <button id="add-bookmark-btn" class="btn btn-outline">
          <i class="fa-regular fa-bookmark" style="margin-right:5px;"></i> Add Bookmark
        </button>
      `;
      document.getElementById("add-bookmark-btn").onclick = async () => {
        await Database.putStory(this.#story);
        this.renderBookmarkButton();
        Swal.fire({
          icon: "success",
          title: "Bookmarked!",
          text: "This story has been added to your bookmarks.",
          showConfirmButton: false,
          timer: 1500,
        });
      };
    }
  }
}
