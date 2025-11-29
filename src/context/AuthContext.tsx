import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { Session } from "@supabase/supabase-js";
import supabase from "../supabase-client";

const AuthContext = createContext<{
  session: Session | null;
  signInUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
  signOutUser: () => Promise<{ success: boolean; error?: string }>;
}>({
  session: null,
  signInUser: async () => ({ success: false }),
  signOutUser: async () => ({ success: false }),
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  // Fetch the initial session and set up a listener for auth state changes
  const getInitialSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      console.log(data.session);

      setSession(data.session);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Unexpected error fetching session:", errorMessage);
    }
  };
  useEffect(() => {
    getInitialSession();

    // Set up the auth state change listener
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("session changed", session);
    });
  }, []);

  // Function to sign in a user
  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });
      if (error) {
        console.error("Supabase sign-in error:", error.message);
        return { success: false, error: error.message };
      }
      console.log("Supabase sign-in success:", data);
      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Unexpected error during sign-in:", errorMessage);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // signOut
  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign-in error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Unexpected error during sign-out:", errorMessage);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ session, signInUser, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
