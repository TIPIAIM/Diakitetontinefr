{/*import { createBrowserRouter, Navigate } from "react-router-dom";

import GuestOnly from "../components/auth/GuestOnly";
import RequireAuth from "../components/auth/RequireAuth";
import RoleRedirect from "../components/auth/RoleRedirect";
import DashboardLayout from "../components/layout/DashboardLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailForm";

import MembersPage from "../pages/admin/Members/MembersPage";
import CyclesPage from "../pages/admin/cycle/CyclesPage";

import { USER_ROLES } from "../utils/roleRedirect";
import ContributionsPage from "../pages/admin/contributions/ContributionsPage";
import PayoutsPage from "../pages/admin/payouts/PayoutsPage";
import DashboardPage from "../pages/admin/dashboard/DashboardPage";
import RemindersPage from "../pages/admin/reminders/RemindersPage";
import ReportsPage from "../pages/admin/reports/ReportsPage";
import SettingsPage from "../pages/admin/settings/SettingsPage";
import AuditsPage from "../pages/admin/audits/AuditsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleRedirect />,
  },

  {
    element: <GuestOnly />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
    ],
  },

  {
    element: <RequireAuth allowedRoles={[USER_ROLES.ADMIN]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/admin",
            element: <DashboardPage />,
          },
          {
            path: "/members",
            element: <MembersPage />,
          },
          {
            path: "/cycles",
            element: <CyclesPage />,
          },
          {
            path: "/contributions",
            element: <ContributionsPage />,
          },
          {
            path: "/payouts",
            element: <PayoutsPage />,
          },
          {
            path: "/reminders",
            element: <RemindersPage />,
          },
          {
            path: "/reports",
            element: <ReportsPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/audits",
            element: <AuditsPage />,
          }
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
*/}
// src/routes/router.jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import GuestOnly from "../components/auth/GuestOnly";
import RequireAuth from "../components/auth/RequireAuth";
import RoleRedirect from "../components/auth/RoleRedirect";
import DashboardLayout from "../components/layout/DashboardLayout";

import PageLoader from "../components/common/PageLoader";
import ErrorBoundary from "../components/common/ErrorBoundary";
import RouteTransition from "../components/common/RouteTransition";

import { USER_ROLES } from "../utils/roleRedirect";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailForm"));

const DashboardPage = lazy(() =>
  import("../pages/admin/dashboard/DashboardPage")
);

const MembersPage = lazy(() => import("../pages/admin/Members/MembersPage"));

const CyclesPage = lazy(() => import("../pages/admin/cycle/CyclesPage"));

const ContributionsPage = lazy(() =>
  import("../pages/admin/contributions/ContributionsPage")
);

const PayoutsPage = lazy(() => import("../pages/admin/payouts/PayoutsPage"));

const RemindersPage = lazy(() =>
  import("../pages/admin/reminders/RemindersPage")
);

const ReportsPage = lazy(() => import("../pages/admin/reports/ReportsPage"));

const SettingsPage = lazy(() => import("../pages/admin/settings/SettingsPage"));

const AuditsPage = lazy(() => import("../pages/admin/audits/AuditsPage"));

const BackupsPage = lazy(() => import("../pages/admin/backups/BackupsPage"));

const LazyPage = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader label="Chargement de la page..." />}>
        <RouteTransition>{children}</RouteTransition>
      </Suspense>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleRedirect />,
  },

  {
    element: <GuestOnly />,
    children: [
      {
        path: "/login",
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
      {
        path: "/register",
        element: (
          <LazyPage>
            <RegisterPage />
          </LazyPage>
        ),
      },
      {
        path: "/verify-email",
        element: (
          <LazyPage>
            <VerifyEmailPage />
          </LazyPage>
        ),
      },
    ],
  },

  {
    element: <RequireAuth allowedRoles={[USER_ROLES.ADMIN]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/admin",
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: "/members",
            element: (
              <LazyPage>
                <MembersPage />
              </LazyPage>
            ),
          },
          {
            path: "/cycles",
            element: (
              <LazyPage>
                <CyclesPage />
              </LazyPage>
            ),
          },
          {
            path: "/contributions",
            element: (
              <LazyPage>
                <ContributionsPage />
              </LazyPage>
            ),
          },
          {
            path: "/payouts",
            element: (
              <LazyPage>
                <PayoutsPage />
              </LazyPage>
            ),
          },
          {
            path: "/reminders",
            element: (
              <LazyPage>
                <RemindersPage />
              </LazyPage>
            ),
          },
          {
            path: "/reports",
            element: (
              <LazyPage>
                <ReportsPage />
              </LazyPage>
            ),
          },
          {
            path: "/settings",
            element: (
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            ),
          },
          {
            path: "/audits",
            element: (
              <LazyPage>
                <AuditsPage />
              </LazyPage>
            ),
          },
          {
            path: "/backups",
            element: (
              <LazyPage>
                <BackupsPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;