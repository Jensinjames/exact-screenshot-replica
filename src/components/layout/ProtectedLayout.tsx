import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from './AppLayout';
import { PageLoader } from '@/components/ui/page-loader';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
