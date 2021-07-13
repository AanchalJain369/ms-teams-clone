
var cacheName='cache-v2';
var resources=[
    
];
var optionalResources=[
    //optional
];
self.addEventListener('install',event=>{
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName)
        .then(cache=> {
            cache.addAll(optionalResources);
            return cache.addAll(resources);})
    )
});
self.addEventListener('activate',event=>{});
self.addEventListener('fetch',(event)=>{
    event.respondWith(caches.match(event.request)
    .then(cachedResponse=>{return cachedResponse ||fetch(event.request);}))    
})
/* self.addEventListener('push',event=>{
    const title="this is my title";
    const body="Lets go";
    const icon="icon.png";
    const tag="aj-tag";
    event.waitUntil(
        self.registration.showNotification(title,{
            body:body,
            icon:icon,
            tag:tag
        })
    )
})
 */
