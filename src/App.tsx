
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import React, { Suspense } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingChat from "@/components/chat/FloatingChat";
const Login = React.lazy(() => import('./pages/Login'));
const TutorRegister = React.lazy(() => import('./pages/TutorRegister'));
const Search = React.lazy(() => import('./pages/Search'));
const Booking = React.lazy(() => import('./pages/Booking'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const DebugSignUp = React.lazy(() => import('./pages/DebugSignUp'));
const Account = React.lazy(() => import('./pages/Account'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const SessionPage = React.lazy(() => import('./pages/SessionPage'));
const TutorProfile = React.lazy(() => import('./pages/TutorProfile'));
const TutorDashboard = React.lazy(() => import('./pages/TutorDashboard'));
const UsersManagement = React.lazy(() => import('./pages/admin/UsersManagement'));
const TutorsManagement = React.lazy(() => import('./pages/admin/TutorsManagement'));
const BookingsManagement = React.lazy(() => import('./pages/admin/BookingsManagement'));
const ErrorMonitoring = React.lazy(() => import('./pages/admin/ErrorMonitoring'));
const AdminProfile = React.lazy(() => import('./pages/admin/AdminProfile'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const UserApprovals = React.lazy(() => import('./pages/admin/UserApprovals'));
const AdminRouteWrapper = React.lazy(() => import('./components/admin/AdminRouteWrapper'));
const ErrorTest = React.lazy(() => import('./pages/ErrorTest'));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <FloatingChat />
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/debug-signup" element={<DebugSignUp />} />
                  <Route path="/tutor/register" element={<TutorRegister />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/tutor/:tutorId" element={<TutorProfile />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute><AdminRouteWrapper><UsersManagement /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/tutors" element={<ProtectedRoute><AdminRouteWrapper><TutorsManagement /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/bookings" element={<ProtectedRoute><AdminRouteWrapper><BookingsManagement /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute><AdminRouteWrapper><AdminReports /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/errors" element={<ProtectedRoute><AdminRouteWrapper><ErrorMonitoring /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/profile" element={<ProtectedRoute><AdminRouteWrapper><AdminProfile /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><AdminRouteWrapper><AdminSettings /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/admin/approvals" element={<ProtectedRoute><AdminRouteWrapper><UserApprovals /></AdminRouteWrapper></ProtectedRoute>} />
                  <Route path="/error-test" element={<ErrorTest />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/session/:bookingId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
                  <Route path="/tutor/dashboard" element={<ProtectedRoute><TutorDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
