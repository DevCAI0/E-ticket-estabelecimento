/// <reference lib="webworker" />

declare const self: any;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

export {};
