import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { Session } from "@supabase/supabase-js";
import supabase from "../supabase-client";

const AuthContext = createContext<{ session: Session | null }>({
  session: null,
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
  });

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
