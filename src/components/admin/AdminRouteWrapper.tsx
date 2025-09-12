import React from 'react';
import AdminLayout from './AdminLayout';

interface AdminRouteWrapperProps {
  children: React.ReactNode;
}

const AdminRouteWrapper: React.FC<AdminRouteWrapperProps> = ({ children }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRouteWrapper;
