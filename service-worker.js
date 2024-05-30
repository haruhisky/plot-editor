self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/plot-editor/index.html',
                '/plot-editor/styles.css',
                '/plot-editor/scripts.js',
                '/plot-editor/jquery-3.6.0.min.js',
                '/plot-editor/jquery-ui.min.js',
                '/plot-editor/icon-192x192.png',
                '/plot-editor/icon-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
