import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';
import { TerminalBootLoader } from './LoadingIndicator.jsx';

/**
 * Route guard that allows access only to authenticated users with role
 * 'superadmin' or 'editor'. Anyone else is redirected to /auth.
 *
 * While auth is still loading it renders a minimal loading state so there
 * is no flash-of-content before the redirect fires.
 */
export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still resolving session — hold render to avoid flash
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-void">
        <TerminalBootLoader title="VERIFYING_ADMIN_UPLINK" />
      </div>
    );
  }

  // Not logged in → send to auth with intended destination preserved
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but not admin/editor
  if (user.role !== 'superadmin' && user.role !== 'editor') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono text-center gap-4 px-6">
        <ShieldAlert className="h-10 w-10 text-blaze" />
        <h1 className="text-blaze font-display font-black text-xl tracking-widest">
          ACCESS_DENIED
        </h1>
        <p className="text-soft-ash/60 text-xs max-w-sm leading-relaxed">
          // This sector requires superadmin or editor clearance.<br />
          // Your current role is: <span className="text-acid">{user.role?.toUpperCase() || 'UNKNOWN'}</span>
        </p>
        <a
          href="/"
          className="mt-2 text-[11px] border border-acid/40 px-4 py-2 rounded text-acid hover:border-acid transition-all"
        >
          RETURN_TO_MAINFRAME
        </a>
      </div>
    );
  }

  // Authenticated admin/editor — render the protected page
  return children;
}
