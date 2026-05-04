import { Navigate } from 'react-router-dom';
import { useAuth } from './auth';

// Route guard — redirects to /login if unauthenticated.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground" data-testid="auth-loading">
      Loading…
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
