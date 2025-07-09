import { createPage } from './creator.js';

function log(message, prefix = '[MAN]') {
    console.log(prefix + message);
}

export default function() {
    log('Initializing...');

    createPage();
    log('Inital page loaded');

    document.querySelector('.dock #new-tab').addEventListener('click', () => {
        log('Creating new tab...');
        createPage();
    });
}