import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import { Sidebar } from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Specialties from "./pages/Specialties";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update the user state
      setLoadingAuth(false); // Mark auth check as complete
      console.log("Auth state changed. Current user:", user);
    });

    return () => unsubscribe();
  }, []);
  if (loadingAuth) {
    return <div>Loading authentication...</div>; // Replace with a proper loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Conditional rendering based on authentication status */}
          {currentUser ? (
            // User is signed in, show the main layout and protected routes
            <div className="layout-grid">
              <Sidebar />
              <main className="p-0 md:p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-none md:rounded-xl shadow-sm overflow-hidden">
                  <Routes>
                    {/* Protected Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/specialties" element={<Specialties />} />
                    {/* Redirect login route if already authenticated */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    {/* Fallback for unmatched routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          ) : (
            // User is NOT signed in, only show the login page
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Redirect any other path to login if not authenticated */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
