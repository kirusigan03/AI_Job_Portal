import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PublicRoute } from '@/routes/PublicRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { Toaster } from '@/components/ui/toaster'
import { ScrollToTop } from '@/routes/ScrollToTop'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLES } from '@/utils/constants'

// Public
const Home = lazy(() => import('@/pages/public/Home'))
const Jobs = lazy(() => import('@/pages/public/Jobs'))
const JobDetail = lazy(() => import('@/pages/public/JobDetail'))
const Companies = lazy(() => import('@/pages/public/Companies'))
const AiCareer = lazy(() => import('@/pages/public/AiCareer'))
const StaticPage = lazy(() => import('@/pages/public/StaticPage'))
const Login = lazy(() => import('@/pages/public/Login'))
const Register = lazy(() => import('@/pages/public/Register'))
const NotFound = lazy(() => import('@/pages/public/NotFound'))
const Forbidden = lazy(() => import('@/pages/public/Forbidden'))

// Job seeker
const Dashboard = lazy(() => import('@/pages/seeker/Dashboard'))
const Applications = lazy(() => import('@/pages/seeker/Applications'))
const ApplicationDetail = lazy(() => import('@/pages/seeker/ApplicationDetail'))
const Resumes = lazy(() => import('@/pages/seeker/Resumes'))
const AiAnalysis = lazy(() => import('@/pages/seeker/AiAnalysis'))
const Notifications = lazy(() => import('@/pages/seeker/Notifications'))
const Profile = lazy(() => import('@/pages/seeker/Profile'))
const Settings = lazy(() => import('@/pages/seeker/Settings'))

// Employer
const EmployerDashboard = lazy(() => import('@/pages/employer/EmployerDashboard'))
const EmployerJobs = lazy(() => import('@/pages/employer/EmployerJobs'))
const CreateJob = lazy(() => import('@/pages/employer/CreateJob'))
const ManageJob = lazy(() => import('@/pages/employer/ManageJob'))
const EmployerApplications = lazy(() => import('@/pages/employer/EmployerApplications'))
const Candidates = lazy(() => import('@/pages/employer/Candidates'))
const CandidateDetail = lazy(() => import('@/pages/employer/CandidateDetail'))

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminJobs = lazy(() => import('@/pages/admin/AdminJobs'))
const AdminApplications = lazy(() => import('@/pages/admin/AdminApplications'))

/** Placeholder shown while a lazily loaded route chunk arrives. */
function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Auth screens carry their own layout */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/ai-career" element={<AiCareer />} />
            <Route path="/about" element={<StaticPage page="about" />} />
            <Route path="/privacy" element={<StaticPage page="privacy" />} />
            <Route path="/terms" element={<StaticPage page="terms" />} />
            <Route path="/contact" element={<StaticPage page="contact" />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Signed-in area */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Shared by every role */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Job seeker */}
              <Route element={<RoleRoute allow={[ROLES.JOB_SEEKER]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/resumes" element={<Resumes />} />
                <Route path="/ai-analysis" element={<AiAnalysis />} />
              </Route>

              {/* Employer */}
              <Route element={<RoleRoute allow={[ROLES.EMPLOYER]} />}>
                <Route path="/employer" element={<EmployerDashboard />} />
                <Route path="/employer/jobs" element={<EmployerJobs />} />
                <Route path="/employer/jobs/create" element={<CreateJob />} />
                <Route path="/employer/jobs/:id/edit" element={<ManageJob />} />
                <Route path="/employer/applications" element={<EmployerApplications />} />
                <Route path="/employer/candidates" element={<Candidates />} />
                <Route path="/employer/candidates/:id" element={<CandidateDetail />} />
              </Route>

              {/* Admin */}
              <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
              </Route>
            </Route>
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
