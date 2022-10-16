import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Toast
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// components
import Navbar from './components/Navbar'
import PrivateRoutes from './components/PrivateRoutes'
// Leaflet
import { MapContainer, MArker, Popup, TileLayer } from 'react-leaflet'
// pages
import ForgotPassword from './pages/ForgotPassword'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Explore from './pages/Explore'
import Category from './pages/Category'
import CreateListing from './pages/CreateListing'
import Listing from './pages/Listing'
import Contact from './pages/Contact'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/category/:categoryName' element={<Category />} />
          <Route
            path='/category/:categoryName/:listingId'
            element={<Listing />}
          />
          <Route path='/profile' element={<PrivateRoutes />}>
            <Route path='/profile' element={<Profile />} />
          </Route>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/contact/:landlordId' element={<Contact />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/create-listing' element={<CreateListing />} />
        </Routes>

        {/* Navbar */}
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
