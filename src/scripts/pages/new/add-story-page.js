import AddStoryPresenter from "./add-story-presenter.js";
import * as StoriesAPI from "../../data/api.js";
import Swal from "sweetalert2";
import Camera from "../../utils/camera.js";
import { setupMapInput, addMarker, clearMarkers } from "../../utils/map.js";

export default class AddStoryPage {
  #presenter;
  #form;
  #camera;

  async render() {
    return `
      <section class="add-story-page container">
        <div class="add-story-card">
          <div class="add-story__header">
            <h1 class="add-story__title">Add New Story</h1>
            <p class="add-story__description">
              Fill out the form below to share your story.
            </p>
          </div>
          <form id="add-story-form" class="add-story__form">
            <div class="form-control">
              <label for="description-input">Description</label>
              <textarea
                id="description-input"
                name="description"
                placeholder="Write your story here..."
                required
              ></textarea>
            </div>
            <div class="form-control">
              <label for="photo-input">Photo (Max: 1MB)</label>
              <div class="custom-file-picker">
                <input
                  id="photo-input"
                  name="photo"
                  type="file"
                  accept="image/*"
                  hidden
                />
                <button type="button" id="start-camera-button" class="btn btn-outline">
                <i class="fa-solid fa-camera" style="margin-right: 5px;"></i>
                  Start Camera
                </button>
                <button type="button" id="photo-picker-button" class="btn">
                  <i class="fa-solid fa-upload" style="margin-right: 7px;"></i>Choose Photo
                </button>
                <span id="photo-file-name" class="file-name">No file chosen</span>
              </div>
              <div id="photo-preview" class="photo-preview"></div>
            </div>
            <div class="form-control">
              <label for="camera-container">Take a Picture</label>
              <div id="camera-container" class="camera-container">
                <video id="camera-video" class="camera-video" autoplay></video>
                <canvas id="camera-canvas" class="camera-canvas"></canvas>
                <div class="camera-controls">
                  <button id="camera-take-button" class="btn" type="button"><i class="fa-regular fa-circle" style="margin-right:7px;"></i>Take Picture</button>
                  <button id="camera-close-button" class="btn btn-outline" type="button">Close Camera</button>
                </div>
              </div>
            </div>
            <div class="form-control">
              <label for="map-container" class="map-label">Select Location (Optional)</label>
              <div id="map-container" class="map-container"></div>
              <button type="button" id="use-current-location-button" class="btn btn-outline">
              <i class="fa-solid fa-location-arrow" style="margin-right: 5px;"></i>Use My Current Location
              </button>
              <input type="hidden" id="latitude-input" name="latitude" />
              <input type="hidden" id="longitude-input" name="longitude" />
            </div>
            <div class="form-buttons">
              <button type="submit" class="btn">
                <i class="fa-solid fa-plus" style="margin-right: 7px;"></i>Submit Story
              </button>
              <a href="#/" class="btn btn-outline">Cancel</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoriesAPI,
    });

    this.#setupForm();
    this.#setupFilePicker();
    this.#setupCamera();

    // Initialize the map for location input
    let currentMarker = null; // Variable to store the current marker
    const map = setupMapInput(
      "map-container",
      [-6.99117, 110.43458],
      (coords) => {
        // Remove the existing marker if it exists
        if (currentMarker) {
          map.removeLayer(currentMarker);
        }

        // Add a new marker at the selected location
        currentMarker = addMarker(
          [coords.lat, coords.lon],
          "Selected Location",
          map
        );

        // Update the hidden inputs with the selected coordinates
        document.getElementById("latitude-input").value = coords.lat;
        document.getElementById("longitude-input").value = coords.lon;
      }
    );

    // Handle "Use My Current Location" button click
    const useCurrentLocationButton = document.getElementById(
      "use-current-location-button"
    );
    useCurrentLocationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        Swal.fire({
          icon: "error",
          title: "Geolocation Not Supported",
          text: "Your browser does not support geolocation.",
          confirmButtonText: "OK",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (currentMarker) {
            clearMarkers();
          }

          // Add a new marker at the user's current location
          currentMarker = addMarker(
            [latitude, longitude],
            "Your Current Location",
            map
          );

          // Update the hidden inputs with the user's current coordinates
          document.getElementById("latitude-input").value = latitude;
          document.getElementById("longitude-input").value = longitude;

          // Center the map on the user's location
          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.error("Geolocation error:", error);
          Swal.fire({
            icon: "error",
            title: "Failed to Get Location",
            text: "Unable to retrieve your location. Please try again.",
            confirmButtonText: "OK",
          });
        }
      );
    });
  }

  #setupCamera() {
    const videoElement = document.getElementById("camera-video");
    const canvasElement = document.getElementById("camera-canvas");
    const takePictureButton = document.getElementById("camera-take-button");
    const closeCameraButton = document.getElementById("camera-close-button");
    const startCameraButton = document.getElementById("start-camera-button");
    const photoPreview = document.getElementById("photo-preview");
    const fileInput = document.getElementById("photo-input");

    this.#camera = new Camera(videoElement);

    // Start the camera when the "Start Camera" button is clicked
    startCameraButton.addEventListener("click", async () => {
      try {
        await this.#camera.startCamera();
        document.getElementById("camera-container").style.display = "block"; // Show the camera container
      } catch (error) {
        console.error(error.message);
      }
    });

    // Take a picture
    takePictureButton.addEventListener("click", async () => {
      const blob = await this.#camera.captureImage(canvasElement);

      // Display the captured photo in the preview
      const url = URL.createObjectURL(blob);
      photoPreview.innerHTML = `<img src="${url}" alt="Captured Photo" class="photo-preview__image" />`;

      // Set the Blob as the photo input value
      const dataTransfer = new DataTransfer();
      const file = new File([blob], "captured-photo.jpg", {
        type: "image/jpeg",
      });
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    });

    // Close the camera
    closeCameraButton.addEventListener("click", () => {
      this.#camera.stopCamera();
      document.getElementById("camera-container").style.display = "none";
    });

    // Initially hide the camera container
    document.getElementById("camera-container").style.display = "none";
  }

  #setupFilePicker() {
    const fileInput = document.getElementById("photo-input");
    const filePickerButton = document.getElementById("photo-picker-button");
    const fileNameDisplay = document.getElementById("photo-file-name");
    const photoPreview = document.getElementById("photo-preview");

    filePickerButton.addEventListener("click", () => {
      fileInput.click(); // Trigger the hidden file input
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        // Check if the file size exceeds 1MB
        const maxSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes
        if (file.size > maxSizeInBytes) {
          Swal.fire({
            icon: "warning",
            title: "File Too Large",
            text: "The selected image exceeds the maximum size of 1MB. Please choose a smaller file.",
            confirmButtonText: "OK",
          });
          // Clear the file input and preview
          fileInput.value = "";
          fileNameDisplay.textContent = "No file chosen";
          photoPreview.innerHTML = "";
          return;
        }

        fileNameDisplay.textContent = file.name; // Display the file name

        // Display a preview of the selected image
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="Selected Photo" class="photo-preview__image" />`;
        };
        reader.readAsDataURL(file);
      } else {
        fileNameDisplay.textContent = "No file chosen";
        photoPreview.innerHTML = ""; // Clear the preview
      }
    });
  }

  #setupForm() {
    this.#form = document.getElementById("add-story-form");
    const cameraContainer = document.getElementById("camera-container");

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      // Close the camera if it's still open
      if (cameraContainer.style.display === "block") {
        this.#camera.stopCamera();
        cameraContainer.style.display = "none";
      }
      const data = {
        description: this.#form.elements.namedItem("description").value,
        photo: this.#form.elements.namedItem("photo").files[0],
        latitude: this.#form.elements.namedItem("latitude").value,
        longitude: this.#form.elements.namedItem("longitude").value,
      };

      await this.#presenter.submitStory(data);
    });
  }

  showMapLoading() {
    document.getElementById(
      "map-container"
    ).innerHTML = `<p>Loading map...</p>`;
  }

  hideMapLoading() {
    document.getElementById("map-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.querySelector(
      ".form-buttons button[type='submit']"
    ).innerHTML = `<i class="fas fa-spinner loader-button"></i> Submitting...`;
    document.querySelector(
      ".form-buttons button[type='submit']"
    ).disabled = true;
  }

  hideSubmitLoadingButton() {
    document.querySelector(
      ".form-buttons button[type='submit']"
    ).innerHTML = `Submit Story`;
    document.querySelector(
      ".form-buttons button[type='submit']"
    ).disabled = false;
  }

  showSuccessMessage(message) {
    Swal.fire({
      icon: "success",
      title: "Submitted Successfully",
      text: message,
      confirmButtonText: "OK",
    }).then(() => {
      // Redirect to the home page or any other page after success
      location.hash = "#/";
    });
  }

  showErrorMessage(message) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonText: "OK",
    });
  }
}
