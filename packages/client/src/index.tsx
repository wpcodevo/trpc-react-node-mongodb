import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { StateContextProvider } from './context';
import './global.css';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <StateContextProvider>
      <Router>
        <App />
        <ToastContainer />
      </Router>
    </StateContextProvider>
  </React.StrictMode>
);
