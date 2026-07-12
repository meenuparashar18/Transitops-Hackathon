import React from 'react';

export default function ProtectedRoute({ token, user, allowedRoles, children }) {
  if (!token || !user) {
    return <div className="alert-banner alert-banner-danger">Not Authenticated: Please sign in.</div>;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="alert-banner alert-banner-danger">Access Denied: Insufficient permissions.</div>;
  }
  
  return children;
}
