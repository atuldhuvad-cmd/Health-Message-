const CACHE_PREFIX='health-infographic-studio-';
const CACHE='health-infographic-studio-2.2-assets-v1';
const CORE=['./','./index.html','./manifest.webmanifest'];
const ARTWORK=[
'art-alcohol-v1.png','art-anaemia-v1.png','art-blood-pressure-v1.png','art-blood-v1.png','art-brain-v1.png','art-cancer-v1.png','art-child-health-v1.png','art-diabetes-v1.png','art-eye-health-v1.png','art-first-aid-v1.png','art-food-safety-v1.png','art-hand-hygiene-v1.png','art-healthy-ageing-v1.png','art-hearing-v1.png','art-heart-v1.png','art-heat-health-v1.png','art-hepatitis-v1.png','art-kidney-v1.png','art-malaria-dengue-v1.png','art-maternal-health-v1.png','art-men-health-v1.png','art-mental-v1.png','art-newborn-v1.png','art-nutrition-v1.png','art-occupational-health-v1.png','art-oral-health-v1.png','art-organ-donation-v1.png','art-respiratory-health-v1.png','art-road-safety-v1.png','art-sanitation-v1.png','art-sleep-v1.png','art-tobacco-v1.png','art-tuberculosis-v1.png','art-vaccination-v1.png','art-water-v1.png','art-women-health-v1.png','art-yoga-v1.png'
].map(file=>`./artwork/${file}`);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='PRECACHE_ARTWORK')event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(ARTWORK.map(url=>cache.add(url)))))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>{
    const network=fetch(event.request).then(response=>{if(response.ok&&new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone())).catch(()=>{});return response});
    return cached||network.catch(()=>caches.match('./index.html'));
  }));
});
