const CACHE='routine-v2';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
);});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const req=e.request;
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    e.respondWith(
      fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp));return resp;})
        .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
    if(resp&&resp.status===200&&resp.type==='basic'){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
    return resp;
  })));
});
