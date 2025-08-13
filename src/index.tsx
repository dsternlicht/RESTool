import React from 'react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import * as serviceWorker from './serviceWorker';
import './i18n';

import './index.scss';

ReactDOM.render(
    <Suspense fallback={null}>
        <App />
    </Suspense>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
