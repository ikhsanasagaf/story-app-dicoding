export default class Camera {
  #currentStream;
  #videoElement;

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
      return;
    }
    window.currentStreams = [...window.currentStreams, stream];
  }

  static stopAllStreams() {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
      return;
    }
    window.currentStreams.forEach((stream) => {
      if (stream.active) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
    window.currentStreams = [];
  }

  constructor(videoElement) {
    this.#videoElement = videoElement;
  }

  async startCamera() {
    try {
      this.#currentStream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Add the stream to the global list
      Camera.addNewStream(this.#currentStream);

      this.#videoElement.srcObject = this.#currentStream;
      this.#videoElement.play();
    } catch (error) {
      console.error("Error starting the camera:", error);
      throw new Error("Unable to access the camera.");
    }
  }

  stopCamera() {
    if (this.#currentStream) {
      this.#currentStream.getTracks().forEach((track) => track.stop());
      this.#currentStream = null;
    }
    this.#videoElement.srcObject = null;
  }

  captureImage(canvasElement) {
    const context = canvasElement.getContext("2d");
    canvasElement.width = this.#videoElement.videoWidth;
    canvasElement.height = this.#videoElement.videoHeight;
    context.drawImage(
      this.#videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    return new Promise((resolve) => {
      canvasElement.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  }
}
