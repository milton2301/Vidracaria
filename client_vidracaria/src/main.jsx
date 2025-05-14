import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

fetch(`${base}/imagens`)
  .then(res => res.json())
  .then(data => {
    const logo = data.find(img => img.tipo === 'Logo Header');
    if (logo) {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      favicon.href = `${base}/uploads/${logo.caminho}`;
      document.head.appendChild(favicon);
    }
  })
  .catch(err => console.error('Erro ao definir favicon:', err));


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
