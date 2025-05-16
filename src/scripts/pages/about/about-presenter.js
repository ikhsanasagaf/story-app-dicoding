export default class AboutPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async loadAboutContent() {
    const aboutContent = {
      title: 'About the Story App',
      sections: [
        {
          icon: 'fas fa-info-circle',
          text: 'This website is created for the purpose of submitting the first project of the Intermediate Web Development course.',
        },
        {
          icon: 'fas fa-code',
          text: 'This website uses standard web technologies: <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong>.',
        },
        {
          icon: 'fas fa-layer-group',
          text: 'It is designed as a <strong>Single-Page Application (SPA)</strong> with an <strong>MVP pattern</strong>.',
        },
        {
          icon: 'fas fa-network-wired',
          text: 'Using Fetch API to communicate with Dicoding Story API, and <i class="fas fa-camera"></i> MediaDevices API (getUserMedia) for camera access.',
        },
      ],
    };

    this.#view.renderAboutContent(aboutContent);
  }
}