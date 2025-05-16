import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../data/api";
import Swal from "sweetalert2";

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    Swal.fire({
      title: "Notification Permission Denied!",
      text: "Please enable notifications in your browser settings.",
      icon: "error",
      confirmButtonText: "Close",
    });
    return false;
  }

  if (status === "default") {
    Swal.fire({
      title: "Notification Permission Blocked!",
      text: "Please enable notifications in your browser settings.",
      icon: "error",
      confirmButtonText: "Close",
    });
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    Swal.fire({
      title: "Already Subscribed!",
      text: "You are already subscribed to push notifications.",
      icon: "info",
      confirmButtonText: "Close",
    });
    return;
  }

  console.log("Mulai berlangganan push notification...");

  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe: response:", response);
      Swal.fire({
        title: "Subscription Failed!",
        text: "Failed to subscribe to push notifications.",
        icon: "error",
        confirmButtonText: "Close",
      });

      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();

      return;
    }

    Swal.fire({
      title: "Subscribed Successfully!",
      text: "You have successfully subscribed to push notifications.",
      icon: "success",
      confirmButtonText: "Close",
    });
  } catch (error) {
    console.error("subscribe: error:", error);
    Swal.fire({
      title: "Subscription Failed!",
      text: "Failed to subscribe to push notifications.",
      icon: "error",
      confirmButtonText: "Close",
    });
    // Undo subscribe to push notification
    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      Swal.fire({
        title: "Not Subscribed!",
        text: "You are not subscribed to push notifications.",
        icon: "info",
        confirmButtonText: "Close",
      });
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      Swal.fire({
        title: "Unsubscribe Failed!",
        text: "Failed to unsubscribe from push notifications.",
        icon: "error",
        confirmButtonText: "Close",
      });
      console.error("unsubscribe: response:", response);
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      Swal.fire({
        title: "Unsubscribe Failed!",
        text: "Failed to unsubscribe from push notifications.",
        icon: "error",
        confirmButtonText: "Close",
      });
      await subscribePushNotification({ endpoint, keys });
      return;
    }
    
    Swal.fire({
      title: "Unsubscribed Successfully!",
      text: "You have successfully unsubscribed from push notifications.",
      icon: "success",
      confirmButtonText: "Close",
    });
  } catch (error) {
    Swal.fire({
      title: "Unsubscribe Failed!",
      text: "Failed to unsubscribe from push notifications.",
      icon: "error",
      confirmButtonText: "Close",
    });
    console.error("unsubscribe: error:", error);
  }
}
