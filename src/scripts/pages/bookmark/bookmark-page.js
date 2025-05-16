import BookmarkPresenter from "./bookmark-presenter.js";
import { reverseGeocode } from "../../utils/geocode.js";
import Database from "../../data/database.js";

export default class BookmarkPage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h1 class="bookmark-title">Bookmarked Stories</h1>
        <div id="bookmarked-stories-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });
    
    await this.#presenter.showBookmarkedStories();
}

  showBookmarkedStories(stories) {
    const container = document.getElementById("bookmarked-stories-list");
    container.className = "stories-list";

    container.innerHTML = stories
      .map((story) => {
        const date = new Date(story.createdAt);
        const formattedDate = `${date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        })} ${date.getFullYear()}, ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;

        return `
        <div class="story-card">
          <img class="story-card__image" src="${story.photoUrl}" alt="Photo of the story of '${story.name}'"/>
          <div class="story-card__content">
            <p class="story-card__date"><i class="fa-regular fa-clock" style="margin-right:6px;"></i>${formattedDate}</p>
            <p class="story-card__location" id="bookmark-location-${story.id}">
              <i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Loading location...
            </p>
            <h2 class="story-card__title">${story.name}</h2>
            <p class="story-card__description">${story.description}</p>
            <button class="story-card__button" onclick="location.hash='#/stories/${story.id}'">
              <i class="fa-solid fa-eye" style="margin-right:7px;"></i>View Details
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    // Fetch and update locations asynchronously
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        reverseGeocode(story.lat, story.lon)
          .then((location) => {
            const locationElement = document.getElementById(
              `bookmark-location-${story.id}`
            );
            if (locationElement) {
              locationElement.innerHTML = `<i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>${location}`;
            }
          })
          .catch(() => {
            const locationElement = document.getElementById(
              `bookmark-location-${story.id}`
            );
            if (locationElement) {
              locationElement.innerHTML = `<i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Unknown Location`;
            }
          });
      } else {
        const locationElement = document.getElementById(
          `bookmark-location-${story.id}`
        );
        if (locationElement) {
          locationElement.innerHTML = `<i class="fa-solid fa-map-location-dot" style="margin-right:6px;"></i>Unknown Location`;
        }
      }
    });
  }

  showEmptyBookmark() {
    const container = document.getElementById("bookmarked-stories-list");
    container.innerHTML = "<p>No bookmarked stories yet.</p>";
  }

  showBookmarkError(msg) {
    const container = document.getElementById("bookmarked-stories-list");
    container.innerHTML = `<p class="error-message">${msg}</p>`;
  }
}
