import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, LoginFormData, UserFormData } from "@/types/user";
import { supabase } from "@/lib/supabase";
import { syncService } from "@/services/syncService";

interface AuthContextType {
  user: User | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: UserFormData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  syncData: () => Promise<void>;
  isSyncing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    console.log("AuthProvider: Iniciando verificação de usuário");
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed", event);
        if (session?.user) {
          loadUserFromAuth(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      console.log("checkUser: Verificando sessão...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("checkUser: Erro ao obter sessão", error);
        throw error;
      }
      
      console.log("checkUser: Sessão obtida", !!session);
      
      if (session?.user) {
        loadUserFromAuth(session.user);
      }
    } catch (error) {
      console.error("checkUser: Erro ao verificar usuário:", error);
    } finally {
      console.log("checkUser: Finalizando loading");
      setLoading(false);
    }
  };

  const loadUserFromAuth = (authUser: SupabaseUser) => {
    console.log("loadUserFromAuth: Carregando usuário", authUser.id);
    
    const username = authUser.user_metadata?.username || 
                     authUser.email?.split('@')[0] || 
                     'user';
    
    setUser({
      id: authUser.id,
      email: authUser.email!,
      username: username,
    });

    syncService.setUserId(authUser.id);
    
    syncService.syncAll()
      .then(() => {
        console.log("loadUserFromAuth: Sincronização inicial concluída");
      })
      .catch((error) => {
        console.error("loadUserFromAuth: Erro na sincronização inicial:", error);
      });
    
    console.log("loadUserFromAuth: Usuário carregado com sucesso");
  };

  const login = async (data: LoginFormData) => {
    console.log("login: Tentando fazer login com", data.email);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("login: Erro ao fazer login", error);
      throw error;
    }

    console.log("login: Login bem-sucedido");

    if (authData.user) {
      loadUserFromAuth(authData.user);
    }
  };

  const register = async (data: UserFormData) => {
    console.log("register: Tentando registrar", data.email);
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
        }
      }
    });

    if (signUpError) {
      console.error("register: Erro ao registrar", signUpError);
      throw signUpError;
    }

    console.log("register: Registro bem-sucedido");

    if (authData.user) {
      loadUserFromAuth(authData.user);
    }
  };

  const logout = async () => {
    console.log("logout: Fazendo logout");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("logout: Erro ao fazer logout", error);
      throw error;
    }
    setUser(null);
  };

  const syncData = async () => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    setIsSyncing(true);
    try {
      const result = await syncService.syncAll();
      if (!result.success) {
        throw new Error(result.errors.join(", "));
      }
      console.log("Sincronização concluída:", result);
    } finally {
      setIsSyncing(false);
    }
  };

  console.log("AuthProvider: Render - loading:", loading, "isAuthenticated:", !!user);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        syncData,
        isSyncing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};