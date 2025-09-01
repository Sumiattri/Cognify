import { auth } from "@/firebase/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  await signOut(auth);
};
