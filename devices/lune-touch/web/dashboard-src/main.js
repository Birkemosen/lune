import { mountApp } from './app/app-root.js';

const root = document.getElementById('app');
if (!root) throw new Error('Dashboard root #app not found');
mountApp(root);
