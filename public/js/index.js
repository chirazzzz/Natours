import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login } from './login';
import { displayMap } from './mapbox';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// Values
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    login(email, password);
  });
}
