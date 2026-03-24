import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

// Convert base64 URL-safe string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permissionState, setPermissionState] = useState<PushPermissionState>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const { data: statusData, refetch: refetchStatus } = trpc.notifications.getSubscriptionStatus.useQuery(undefined, {
    retry: false,
  });

  const subscribeMutation = trpc.notifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribe.useMutation();

  // Check current browser permission state
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(Notification.permission as PushPermissionState);
  }, []);

  // Get current SW subscription endpoint
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setCurrentEndpoint(sub.endpoint);
      });
    });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    setIsSubscribing(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PushPermissionState);

      if (permission !== "granted") {
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from env
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("[Push] VAPID public key not found");
        return false;
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        return false;
      }

      setCurrentEndpoint(subJson.endpoint);

      // Send subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        userAgent: navigator.userAgent,
      });

      await refetchStatus();
      return true;
    } catch (error) {
      console.error("[Push] Subscription failed:", error);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [subscribeMutation, refetchStatus]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
        setCurrentEndpoint(null);
      }

      await refetchStatus();
      return true;
    } catch (error) {
      console.error("[Push] Unsubscribe failed:", error);
      return false;
    }
  }, [unsubscribeMutation, refetchStatus]);

  return {
    permissionState,
    isSubscribed: statusData?.isSubscribed ?? false,
    isSubscribing,
    currentEndpoint,
    subscribe,
    unsubscribe,
    refetchStatus,
  };
}
