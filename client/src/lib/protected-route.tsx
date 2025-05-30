import React from 'react';
import { Route, RouteProps } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/protected-layout';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    // Redirect to auth page
    window.location.href = '/auth';
    return null;
  }
  console.log('isAuthenticated', isAuthenticated, 'loading', loading);

  return (
    <ProtectedLayout>
    <Route {...rest} component={Component} />
    </ProtectedLayout>
  );
}