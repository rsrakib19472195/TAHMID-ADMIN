// firebase.js
// ============================================================
// TAHMID JOD / GAME CHANGER - FIREBASE + ONESIGNAL
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCMUpXbPqB0IZX46Ke3iEFRpCABOXLW9oc",
  authDomain: "tahmid-jod.firebaseapp.com",
  databaseURL: "https://tahmid-jod-default-rtdb.firebaseio.com",
  projectId: "tahmid-jod",
  storageBucket: "tahmid-jod.firebasestorage.app",
  messagingSenderId: "650294108563",
  appId: "1:650294108563:web:573e7681e80c984e334866",
  measurementId: "G-9SEJMSHEJS"
};


// ============================================================
// FIREBASE INITIALIZE
// ============================================================

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const rtdb = getDatabase(app);


// ============================================================
// DEFAULT PROFILE PHOTO
// ============================================================

export const DEFAULT_PROFILE_PHOTO =
    "https://videotourl.com/images/1791731746074-18b920d8-818a-422d-98b7-941333ef35c9.jpg";


// ============================================================
// ADMIN
// ============================================================

export const ADMIN_EMAIL =
    "auraskill19@gmail.com";


// ============================================================
// ONESIGNAL
// ============================================================

export const ONESIGNAL_APP_ID =
    "b4420740-b9f6-4de7-8792-f6302ad38e4d";


let oneSignalReadyPromise = null;


// ============================================================
// LOAD / INITIALIZE ONESIGNAL
// ============================================================

export function initOneSignal() {

    if (oneSignalReadyPromise) {
        return oneSignalReadyPromise;
    }


    oneSignalReadyPromise = new Promise((resolve) => {

        let finished = false;

        const finish = (value) => {

            if (finished) {
                return;
            }

            finished = true;

            resolve(value);
        };


        // ----------------------------------------------------
        // TIMEOUT
        // ----------------------------------------------------

        const timeout = setTimeout(() => {

            console.warn(
                "⚠️ OneSignal SDK timeout."
            );

            finish(
                window.OneSignal || null
            );

        }, 12000);


        // ----------------------------------------------------
        // INITIALIZE
        // ----------------------------------------------------

        const initializeOneSignal = async (OneSignal) => {

            try {

                console.log(
                    "🔄 OneSignal object received."
                );


                if (!OneSignal) {

                    console.warn(
                        "❌ OneSignal object পাওয়া যায়নি."
                    );

                    clearTimeout(timeout);

                    finish(null);

                    return;
                }


                // ------------------------------------------------
                // ALREADY AVAILABLE
                // ------------------------------------------------

                if (
                    OneSignal.User &&
                    OneSignal.Notifications
                ) {

                    console.log(
                        "✅ OneSignal already available."
                    );

                    clearTimeout(timeout);

                    finish(OneSignal);

                    return;
                }


                // ------------------------------------------------
                // INIT
                // ------------------------------------------------

                await OneSignal.init({

                    appId: ONESIGNAL_APP_ID

                });


                console.log(
                    "✅ OneSignal initialized successfully."
                );


                clearTimeout(timeout);

                finish(OneSignal);


            } catch (error) {

                console.error(
                    "❌ OneSignal initialization error:",
                    error
                );

                clearTimeout(timeout);

                finish(null);

            }

        };


        // ----------------------------------------------------
        // SDK ALREADY LOADED
        // ----------------------------------------------------

        if (window.OneSignal) {

            initializeOneSignal(
                window.OneSignal
            );

            return;
        }


        // ----------------------------------------------------
        // DEFERRED QUEUE
        // ----------------------------------------------------

        window.OneSignalDeferred =
            window.OneSignalDeferred || [];


        window.OneSignalDeferred.push(
            initializeOneSignal
        );


        // ----------------------------------------------------
        // LOAD SDK IF NOT PRESENT
        // ----------------------------------------------------

        let script =
            document.querySelector(
                'script[src*="OneSignalSDK.page.js"]'
            );


        if (!script) {

            script =
                document.createElement("script");

            script.src =
                "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";

            script.defer = true;

            script.onload = () => {

                console.log(
                    "✅ OneSignal SDK script loaded."
                );

            };


            script.onerror = () => {

                console.error(
                    "❌ OneSignal SDK script failed to load."
                );

                clearTimeout(timeout);

                finish(null);

            };


            document.head.appendChild(script);

        }

    });


    return oneSignalReadyPromise;
}


// ============================================================
// PUSH SUPPORT
// ============================================================

export async function isOneSignalPushSupported() {

    try {

        const OneSignal =
            await initOneSignal();

        if (!OneSignal) {
            return false;
        }


        if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.isPushSupported === "function"
        ) {

            return OneSignal.Notifications.isPushSupported();

        }


        return false;

    } catch (error) {

        console.warn(
            "OneSignal push support check failed:",
            error
        );

        return false;

    }
}


// ============================================================
// PERMISSION STATUS
// ============================================================

export async function getOneSignalPermissionStatus() {

    try {

        const OneSignal =
            await initOneSignal();

        if (!OneSignal) {
            return null;
        }


        return (
            OneSignal.Notifications?.permission ??
            null
        );

    } catch (error) {

        console.warn(
            "Permission status error:",
            error
        );

        return null;

    }
}


// ============================================================
// REQUEST NOTIFICATION PERMISSION
// ============================================================

export async function requestOneSignalPermission() {

    try {

        const OneSignal =
            await initOneSignal();

        if (!OneSignal) {

            console.warn(
                "❌ OneSignal unavailable."
            );

            return false;
        }


        if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.requestPermission === "function"
        ) {

            await OneSignal.Notifications.requestPermission();

            return true;
        }


        return false;

    } catch (error) {

        console.error(
            "❌ Notification permission error:",
            error
        );

        return false;

    }
}


// ============================================================
// LINK FIREBASE USER → ONESIGNAL
// ============================================================

export async function linkOneSignalUser(user) {

    if (!user?.uid) {

        console.warn(
            "⚠️ Firebase user পাওয়া যায়নি."
        );

        return false;
    }


    const uid =
        String(user.uid);


    try {

        console.log("🔗 OneSignal linking শুরু:", uid);

        // Median.co native OneSignal bridge.
        // REST API key is NEVER used in the APK/frontend.
        if (
            window.median &&
            window.median.onesignal &&
            typeof window.median.onesignal.login === "function"
        ) {
            const result = await window.median.onesignal.login(uid);
            console.log("✅ Median OneSignal login:", result);

            try {
                if (typeof window.median.onesignal.info === "function") {
                    const info = await window.median.onesignal.info();
                    console.log("📌 Median OneSignal info:", info);
                }
            } catch (infoError) {
                console.warn("Median OneSignal info unavailable:", infoError);
            }

            return result?.success !== false;
        }

        // Browser fallback: OneSignal Web SDK.
        const OneSignal = await initOneSignal();

        if (!OneSignal) {
            console.warn("⚠️ OneSignal unavailable.");
            return false;
        }

        await OneSignal.login(uid);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const externalId = OneSignal.User?.externalId || null;
        console.log("Firebase UID:", uid, "External ID:", externalId);

        return externalId === uid;


        console.log(
            "================================"
        );

        console.log(
            "📌 ONESIGNAL RESULT"
        );

        console.log(
            "Firebase UID:",
            uid
        );

        console.log(
            "External ID:",
            externalId
        );

        console.log(
            "OneSignal User ID:",
            oneSignalId
        );

        console.log(
            "Subscription ID:",
            subscriptionId
        );

        console.log(
            "Subscribed:",
            optedIn
        );

        console.log(
            "================================"
        );


        return externalId === uid;

    } catch (error) {

        console.error(
            "❌ OneSignal linking failed:",
            error
        );

        return false;

    }
}


// ============================================================
// GET EXTERNAL ID
// ============================================================

export async function getOneSignalExternalId() {

    try {

        const OneSignal =
            await initOneSignal();


        if (!OneSignal) {
            return null;
        }


        return (
            OneSignal.User?.externalId ||
            null
        );

    } catch (error) {

        console.warn(
            "External ID error:",
            error
        );

        return null;

    }
}


// ============================================================
// GET ONESIGNAL USER ID
// ============================================================

export async function getOneSignalUserId() {

    try {

        const OneSignal =
            await initOneSignal();


        if (!OneSignal) {
            return null;
        }


        return (
            OneSignal.User?.onesignalId ||
            null
        );

    } catch (error) {

        console.warn(
            "OneSignal User ID error:",
            error
        );

        return null;

    }
}


// ============================================================
// GET SUBSCRIPTION ID
// ============================================================

export async function getOneSignalSubscriptionId() {

    try {

        const OneSignal =
            await initOneSignal();


        if (!OneSignal) {
            return null;
        }


        return (
            OneSignal.User?.PushSubscription?.id ||
            null
        );

    } catch (error) {

        console.warn(
            "Subscription ID error:",
            error
        );

        return null;

    }
}


// ============================================================
// DEBUG INFORMATION
// ============================================================

export async function getOneSignalDebugInfo() {

    try {

        const OneSignal =
            await initOneSignal();


        if (!OneSignal) {

            return {

                firebaseUid:
                    auth.currentUser?.uid || null,

                externalId: null,

                oneSignalId: null,

                subscriptionId: null,

                optedIn: null,

                permission: null,

                permissionNative: null,

                pushSupported: false,

                sdk: "NOT AVAILABLE"

            };

        }


        let pushSupported = false;


        try {

            if (
                typeof OneSignal.Notifications
                    ?.isPushSupported === "function"
            ) {

                pushSupported =
                    OneSignal.Notifications.isPushSupported();

            }

        } catch (e) {

            pushSupported = false;

        }


        return {

            firebaseUid:
                auth.currentUser?.uid || null,

            externalId:
                OneSignal.User?.externalId || null,

            oneSignalId:
                OneSignal.User?.onesignalId || null,

            subscriptionId:
                OneSignal.User?.PushSubscription?.id || null,

            optedIn:
                OneSignal.User?.PushSubscription?.optedIn ?? null,

            permission:
                OneSignal.Notifications?.permission ?? null,

            permissionNative:
                OneSignal.Notifications?.permissionNative ?? null,

            pushSupported,

            sdk: "AVAILABLE"

        };

    } catch (error) {

        console.error(
            "Debug information error:",
            error
        );


        return {

            firebaseUid:
                auth.currentUser?.uid || null,

            externalId: null,

            oneSignalId: null,

            subscriptionId: null,

            optedIn: null,

            permission: null,

            permissionNative: null,

            pushSupported: false,

            sdk: "ERROR"

        };

    }
}


// ============================================================
// LOGOUT ONESIGNAL USER
// ============================================================

export async function logoutOneSignalUser() {

    try {

        const OneSignal =
            await initOneSignal();


        if (!OneSignal) {
            return false;
        }


        if (
            typeof OneSignal.logout === "function"
        ) {

            await OneSignal.logout();

            console.log(
                "✅ OneSignal logout completed."
            );

            return true;
        }


        return false;

    } catch (error) {

        console.warn(
            "OneSignal logout error:",
            error
        );

        return false;

    }
}
