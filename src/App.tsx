import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { ChatBotProvider } from "@/components/chatbot/ChatBotProvider";
import ChatBot from "@/components/chatbot/ChatBot";
import React, { Suspense } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import LandingPage from "./pages/LandingPage";
import Subjects from "./pages/Subjects";
import About from "./pages/About";
import Contact from "./pages/Contact";

const Login = React.lazy(() => import('./pages/Login'));
const TutorRegister = React.lazy(() => import('./pages/TutorRegister'));
const Search = React.lazy(() => import('./pages/Search'));
const Bookings = React.lazy(() => import('./pages/Booking'));
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
const BlogManagement = React.lazy(() => import('./pages/admin/BlogManagement'));
const ErrorMonitoring = React.lazy(() => import('./pages/admin/ErrorMonitoring'));
const AdminProfile = React.lazy(() => import('./pages/admin/AdminProfile'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const UserApprovals = React.lazy(() => import('./pages/admin/UserApprovals'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const ApprovalPending = React.lazy(() => import('./pages/ApprovalPending'));
const AdminRouteWrapper = React.lazy(() => import('./components/admin/AdminRouteWrapper'));
const ErrorTest = React.lazy(() => import('./pages/ErrorTest'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatBotProvider>
          <AuthProvider>
            <PerformanceMonitor />
            <BrowserRouter>
              <ChatBot />
              <Suspense fallback={<div className="p-6">Loading...</div>}>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={<Index />} />
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
                <Route path="/debug-signup" element={<GuestRoute><DebugSignUp /></GuestRoute>} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Tutor Registration */}
                <Route path="/tutor/register" element={<TutorRegister />} />
                
                {/* Search and Discovery */}
                <Route path="/search" element={<Search />} />
                <Route path="/booking" element={<Bookings />} />
                <Route path="/tutor/:tutorId" element={<TutorProfile />} />
                
                {/* Blog Routes */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Approval Pending Route */}
                <Route path="/approval-pending" element={<ProtectedRoute><ApprovalPending /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><UsersManagement /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/tutors" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><TutorsManagement /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><BookingsManagement /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><BlogManagement /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><AdminReports /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/errors" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><ErrorMonitoring /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><AdminProfile /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><AdminSettings /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/approvals" element={<ProtectedRoute roles={['ADMIN']}><AdminRouteWrapper><UserApprovals /></AdminRouteWrapper></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<AdminDashboard />} />

                {/* User Dashboard Routes */}
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/student/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/session/:bookingId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
                <Route path="/tutor/dashboard" element={<ProtectedRoute roles={['TUTOR']}><TutorDashboard /></ProtectedRoute>} />
                
                {/* Debug/Test Routes */}
                <Route path="/error-test" element={<ErrorTest />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ChatBotProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;