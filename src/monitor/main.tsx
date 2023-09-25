import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('monitor-root') as HTMLElement).render(
  <React.StrictMode>
    <App key={'monitor'} />
  </React.StrictMode>
);
