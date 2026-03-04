import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  displayName: string;
  loading: boolean;
  init: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  displayName: "",
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    const name = user?.user_metadata?.display_name || "";
    set({ user, displayName: name, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      set({ user: u, displayName: u?.user_metadata?.display_name || get().displayName });
    });
  },

  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name || "" } },
    });
    if (error) return error.message;
    return null;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (data.user) {
      set({ displayName: data.user.user_metadata?.display_name || "" });
    }
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, displayName: "" });
  },

  setDisplayName: async (name: string) => {
    set({ displayName: name });
    await supabase.auth.updateUser({ data: { display_name: name } });
  },
}));
