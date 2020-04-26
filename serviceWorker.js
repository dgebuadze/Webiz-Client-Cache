"use strict";

const PREFIX = 'Webiz-Cache'; // Cache prefix
const BUILD = '0a2b8s97e'; // Computed at build time.
const OFFLINE_CACHE = `${PREFIX}-${BUILD}`;

// predefined list of files if available
const CACHE_FILES = [
    './',
    'Webiz-Logo-1.svg',
    'favicon.ico',
    'testing.mp4'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(OFFLINE_CACHE).then(function (cache) {
            return cache.addAll(CACHE_FILES);
        })
    );
});

self.addEventListener('activate', function (event) {
    // deleting outdated caches
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.map(function (key) {
                    if (key !== OFFLINE_CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request).then(function (response) {
                return response;
            });
        })
    );
});
