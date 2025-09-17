// permissions.ts
import { PermissionsAndroid, Permission, Platform } from "react-native";

const REQUIRED_PERMISSIONS: Permission[] = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    // INTERNET permission automatic hoti hai Android me, isko explicitly request karne ki zarurat nahi.
];

export const checkAndRequestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
        return true; // iOS ke liye handle alag hota hai, abhi Android pe focus
    }

    try {
        // ✅ Missing permissions ko filter karna
        const missingPermissions: Permission[] = [];
        for (const permission of REQUIRED_PERMISSIONS) {
            const hasPermission = await PermissionsAndroid.check(permission);
            if (!hasPermission) {
                missingPermissions.push(permission);
            }
        }

        if (missingPermissions.length === 0) {
            return true; // sab permissions already granted
        }

        // ✅ Sirf missing permissions request karo
        const result = await PermissionsAndroid.requestMultiple(missingPermissions);

        // ✅ Check if all requested permissions are granted
        const allGranted = missingPermissions.every(
            (perm) => result[perm] === PermissionsAndroid.RESULTS.GRANTED
        );

        return allGranted;
    } catch (err) {
        console.error("Permission error:", err);
        return false;
    }
};
