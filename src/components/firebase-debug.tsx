"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export function FirebaseDebug() {
  const [configStatus, setConfigStatus] = useState<Record<string, boolean>>({});
  const [authReady, setAuthReady] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "unknown"
  >("unknown");
  const [firestoreTest, setFirestoreTest] = useState<
    "pending" | "success" | "failed"
  >("pending");

  useEffect(() => {
    // Check environment variables directly from process.env
    const config = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    setConfigStatus(config);

    // Check if auth is ready
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });

    // Check network status
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? "online" : "offline");
    };

    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Test Firestore connectivity
    testFirestoreConnection();

    return () => {
      unsubscribe();
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  const testFirestoreConnection = async () => {
    try {
      // Try to read a simple document or create a test query
      const testRef = doc(db, "test", "connectivity");
      await Promise.race([
        getDoc(testRef),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        ),
      ]);
      setFirestoreTest("success");
    } catch (error) {
      console.error("Firestore connectivity test failed:", error);
      setFirestoreTest("failed");
    }
  };

  const testFirebaseConnection = async () => {
    try {
      console.log("Firebase Auth instance:", auth);
      console.log("Current user:", auth.currentUser);
      console.log("Firestore instance:", db);
      console.log("Network status:", networkStatus);

      // Test Firestore again
      await testFirestoreConnection();

      console.log("Environment variables:", {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          ? "Present"
          : "Missing",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env
          .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
          ? "Present"
          : "Missing",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env
          .NEXT_PUBLIC_FIREBASE_PROJECT_ID
          ? "Present"
          : "Missing",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env
          .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          ? "Present"
          : "Missing",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env
          .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
          ? "Present"
          : "Missing",
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
          ? "Present"
          : "Missing",
      });
    } catch (error) {
      console.error("Firebase connection test failed:", error);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Firebase Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Environment Variables:</h4>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {Object.entries(configStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className={value ? "text-green-600" : "text-red-600"}>
                  {key}: {value ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Firebase Status:</h4>
          <div className="text-sm space-y-1">
            <div className={`${authReady ? "text-green-600" : "text-red-600"}`}>
              Auth Ready: {authReady ? "✓" : "✗"}
            </div>
            <div
              className={`${
                networkStatus === "online" ? "text-green-600" : "text-red-600"
              }`}
            >
              Network:{" "}
              {networkStatus === "online"
                ? "✓ Online"
                : networkStatus === "offline"
                ? "✗ Offline"
                : "? Unknown"}
            </div>
            <div
              className={`${
                firestoreTest === "success"
                  ? "text-green-600"
                  : firestoreTest === "failed"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              Firestore:{" "}
              {firestoreTest === "success"
                ? "✓ Connected"
                : firestoreTest === "failed"
                ? "✗ Failed"
                : "⏳ Testing..."}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testFirebaseConnection} variant="outline" size="sm">
            Test Firebase Connection
          </Button>
          <Button onClick={testFirestoreConnection} variant="outline" size="sm">
            Test Firestore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
