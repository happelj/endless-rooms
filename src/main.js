import './style.css';
import { SceneManager } from './scene/SceneManager.js';
import { getRequiredElement } from './utils/dom.js';

const appElement = getRequiredElement('app');
const sceneManager = new SceneManager(appElement);

sceneManager.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    sceneManager.dispose();
  });
}

