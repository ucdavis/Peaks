import 'vite/modulepreload-polyfill';
import { renderApp } from './renderApp';
import './styles/main.css';
import './navigation';

renderApp(document.getElementById('root'));
