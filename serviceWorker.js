"use strict";

const PREFIX = 'Webiz-Cache'; // Cache prefix
const BUILD = '0a2b8s97e'; // Computed at build time.
const OFFLINE_CACHE = `${PREFIX}-${BUILD}`;

// predefined list of files if available
const CACHE_FILES = [
    './'
];

let addToCache = (uri) => {
    caches.open(OFFLINE_CACHE).then(function(cache) {
        return cache.add(uri);
    });
};

self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(OFFLINE_CACHE).then(function(cache) {
            return cache.addAll(CACHE_FILES);
        })
    );
});

self.addEventListener('activate', function(event) {
    // deleting outdated caches
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.map(function(key) {
                    if (key !== OFFLINE_CACHE) {
                       return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    // for media
    if (event.request.headers.get('range')) {
        const position = parseInt(event.request.headers.get('range').split('bytes=')[1].split('-')[0]);
        event.respondWith(
            caches.open(OFFLINE_CACHE)
                .then(function(cache) {
                    return cache.match(event.request.url);
                }).then(function(res) {
                if (!res) {
                    addToCache(event.request.url);
                    return fetch(event.request)
                        .then(res => {
                            return res.arrayBuffer();
                        });
                }
                return res.arrayBuffer();
            }).then(function(file) {
                return new Response(
                    file.slice(position), {
                        status: 206,
                        statusText: 'Partial Content',
                        headers: [
                            ['Content-Range', 'bytes ' + position + '-' + (file.byteLength - 1) + '/' + file.byteLength]]
                    });
            }));
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response)
                    return response;

                addToCache(event.request);

                return fetch(event.request).then(function(response) {
                    return response;
                }).catch(function(error) {
                    throw error;
                });
            })
        );
    }
});