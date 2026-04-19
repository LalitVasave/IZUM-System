import { useCallback, useEffect, useRef, useState } from 'react';

export type GeoPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type UserCoords = { lat: number; lng: number; accuracy?: number };

type Options = {
  /** Request a fix shortly after mount (browser may still show the permission prompt). */
  autoRequest?: boolean;
  /** Keep position updated while tab is open after permission is granted. */
  watch?: boolean;
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
};

export function useUserLocation(options: Options = {}) {
  const {
    autoRequest = false,
    watch = true,
    enableHighAccuracy = true,
    timeoutMs = 12000,
  } = options;

  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [permission, setPermission] = useState<GeoPermissionState>('prompt');
  const watchIdRef = useRef<number>(0);

  const syncPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission('unsupported');
      return;
    }
    const api = navigator.permissions;
    if (!api?.query) return;
    api
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        setPermission(status.state as GeoPermissionState);
        status.onchange = () => setPermission(status.state as GeoPermissionState);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    syncPermission();
  }, [syncPermission]);

  const refresh = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setPermission('unsupported');
        reject(new Error('Geolocation is not available in this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setPermission('granted');
          resolve();
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermission('denied');
            reject(new Error('Location permission was denied.'));
            return;
          }
          if (error.code === error.TIMEOUT) {
            reject(new Error('Location request timed out.'));
            return;
          }
          reject(new Error('Location is unavailable right now.'));
        },
        {
          enableHighAccuracy,
          timeout: timeoutMs,
          maximumAge: 0,
        }
      );
    });
  }, [enableHighAccuracy, timeoutMs]);

  useEffect(() => {
    if (!autoRequest || !navigator.geolocation) return;
    const t = window.setTimeout(() => {
      refresh().catch(() => undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [autoRequest, refresh]);

  useEffect(() => {
    if (!watch || !navigator.geolocation || permission !== 'granted') return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => undefined,
      { enableHighAccuracy, maximumAge: 8000, timeout: 20000 }
    );
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = 0;
      }
    };
  }, [watch, permission, enableHighAccuracy]);

  return { coords, permission, refresh };
}
