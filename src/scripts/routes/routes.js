import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import AddStoryPage from '../pages/new/add-story-page.js';
import StoryDetailsPage from '../pages/details/story-details-page.js';
import LoginPage from '../pages/auth/login/login-page.js';
import RegisterPage from '../pages/auth/register/register-page.js';
import BookmarkPage from '../pages/bookmark/bookmark-page.js';
import NotFoundPage from '../pages/not-found/not-found-page.js';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/add-stories': new AddStoryPage(),
  '/stories/:id': new StoryDetailsPage(),
  '/bookmark': new BookmarkPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/404': new NotFoundPage(),
};

export default routes;
