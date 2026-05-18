import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);


document.body.classList.add('loaded');

root.render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ""}>
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);