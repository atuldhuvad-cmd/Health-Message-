const CACHE='health-infographic-studio-2.4-candidate-v1';
const CORE=[
  './Health_Infographic_Studio_2_4_INSTALLABLE_PWA_CANDIDATE.html',
  './manifest-2.4-candidate.webmanifest',
  './Logo.png',
  './app-icon-192.png',
  './app-icon-512.png',
  './app-icon-maskable-512.png',
  './apple-touch-icon.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('health-infographic-studio-2.4-candidate-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const sameOrigin=url.origin===self.location.origin;
  const isNavigation=event.request.mode==='navigate'||event.request.destination==='document';
  if(isNavigation){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response.ok&&sameOrigin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone())).catch(()=>{});
          return response;
        })
        .catch(()=>caches.match(event.request).then(r=>r||caches.match('./Health_Infographic_Studio_2_4_INSTALLABLE_PWA_CANDIDATE.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        if(response.ok&&sameOrigin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone())).catch(()=>{});
        return response;
      }))
  );
});
