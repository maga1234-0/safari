'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function PwaInstaller() {
  const { toast } = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered with scope: ', registration.scope);
            
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // At this point, the updated precached content has been fetched,
                      // but the previous service worker will still serve the older
                      // content until all client tabs are closed.
                      console.log('New content is available and will be used when all tabs for this page are closed.');
                      toast({
                        title: 'Mise à jour disponible',
                        description: "Une nouvelle version de l'application a été téléchargée. Redémarrez l'application pour l'utiliser.",
                      });
                    } else {
                      // At this point, everything has been precached.
                      // It's the perfect time to display a
                      // "Content is cached for offline use." message.
                      console.log('Content is cached for offline use.');
                       toast({
                        title: 'Application prête hors ligne',
                        description: "L'application est maintenant prête à être utilisée sans connexion internet.",
                      });
                    }
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.error('Service Worker registration failed: ', err);
          });
      });
    }
  }, [toast]);

  return null;
}
