import 'vite/modulepreload-polyfill';
import { renderApp } from './renderApp';
import './sass/site.scss';

renderApp(document.getElementById('root'));
