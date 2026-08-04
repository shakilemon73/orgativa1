import { useEffect, useState, ComponentType } from "react";
import { Route, Redirect, RouteComponentProps } from "wouter";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<any>;
}

export default function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      // 1. Check demo admin session flag
      if (localStorage.getItem("orgativa_demo_admin") === "true") {
        if (isMounted) {
          setIsAuthenticated(true);
          setLoading(false);
        }
        return;
      }

      // 2. Check Supabase auth session
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (isMounted) {
            if (!error && data?.user) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
            setLoading(false);
          }
          return;
        } catch {
          if (isMounted) {
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }
      }

      // 3. Fallback: No active session
      if (isMounted) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    }

    verifyAuth();

    // Listen to real-time auth changes if Supabase is connected
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session || localStorage.getItem("orgativa_demo_admin") === "true") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      });
      authSubscription = listener.subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return (
    <Route path={path}>
      {(params: RouteComponentProps["params"]) => {
        if (loading) {
          return (
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F7F9F6",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3.5px solid #E5EFE2",
                  borderTopColor: "#2D5A27",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#4A5548", fontFamily: "'Inter',sans-serif" }}>
                Verifying admin session...
              </span>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          );
        }

        if (!isAuthenticated) {
          return <Redirect to="/admin/login" />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}
