"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker enregistré avec succès (scope) :", registration.scope);
          })
          .catch((error) => {
            console.warn("Échec d'enregistrement du Service Worker PWA :", error);
          });
      });
    }
  }, []);

  return null;
}
