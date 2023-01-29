// This is the "Offline page" service worker

const CACHE = "pwabuilder-page";

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  console.log(url);
  //document.getElementById('test_page').innerText = url;

  if (event.request.method === 'POST' && url.pathname === '/bookmark.html') {
    event.respondWith((async () => {
      const data = await event.request.formData();

      const title = data.get('title');
      const text = data.get('text');
      const url = data.get('url');

      //document.getElementById('test_url').innerText = url;
      //document.getElementById('test_title').innerText = title;
      //document.getElementById('test_text').innerText = text;

      // Do something with the shared data here.
      var param = '';
      if (typeof url != 'undefined' && url != '')
        param = url;
      else if (typeof text != 'undefined' && text != '')
        param = text;
      else if (typeof title != 'undefined' && title != '')
        param = title;
      
      console.log(title);
      console.log(text);
      console.log(url);

      if (param != '')
        saveUrl(param);

      return Response.redirect('/index.html', 303);
    })());
  }
});
