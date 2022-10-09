import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
// hooks
import { useAuthStatus } from '../hooks/useAuthStatus'

const PrivateRoutes = () => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) {
    return <h3>loading...</h3>
  }

  //   Outlet used so the routes can load the child
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoutes
