import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
// hooks
import { useAuthStatus } from '../hooks/useAuthStatus'
//
import Spinner from '../components/Spinner'

const PrivateRoutes = () => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) {
    return <Spinner />
  }

  //   Outlet used so the routes can load the child
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoutes
