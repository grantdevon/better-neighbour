import messaging from "@react-native-firebase/messaging"
import { PermissionsAndroid, Platform } from "react-native"

export async function requestUserPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        console.log("Notification permission denied on Android.");
        return false;
      }
    } catch (error) {
      console.error("Error requesting Android notification permission:", error);
      return false;
    }
  }

  // For iOS
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      return true;
    } else {
      console.log("Notification permission denied on iOS.");
      return false;
    }
  } catch (error) {
    console.error("Error requesting iOS notification permission:", error);
    return false;
  }
}
