import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../pages/auth/Login'
import { MainLayout } from '../layouts/MainLayout'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { SalesPage } from '../pages/sales/SalesPage'
import { UserRole } from '../types/enums'
import { ProtectedRoute } from '../components/common/ProtectedRoute'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        <Route
          path="sales"
          element={
            <ProtectedRoute
              roles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESPERSON]}
            >
              <SalesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="customers"
          element={
            <ProtectedRoute
              roles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESPERSON]}
            >
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="products"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="inventory"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="suppliers"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="categories"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="users"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}