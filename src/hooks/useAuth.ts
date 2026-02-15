"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getOrCreateUser(firebaseUser);
          setUser(userData);
        } catch (err) {
          console.error("Error creating user doc:", err);
          // Still set a basic user so the app works even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
            createdAt: Timestamp.now(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("Sign in error:", firebaseError.code, firebaseError.message);

      if (firebaseError.code === "auth/popup-blocked") {
        setError("El popup fue bloqueado. Permite popups para localhost en tu navegador.");
      } else if (firebaseError.code === "auth/popup-closed-by-user") {
        // User closed the popup, not an error
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return { user, loading, error, signIn, signOut };
}

async function getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  const newUser: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    createdAt: Timestamp.now(),
  };

  await setDoc(userRef, newUser);
  return newUser;
}
