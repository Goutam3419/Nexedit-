import { useEffect } from "react";
import AppRoutes from "@/router/AppRoutes";
import { subscribeToAuth } from "@/store/authStore";

export default function App() {
  useEffect(() => {
    const unsubscribe = subscribeToAuth();
    return () => unsubscribe();
  }, []);

  return <AppRoutes />;
}
