import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { db } from '../firebase.config'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
// components
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

const CreateListing = () => {
  // state
  // eslint-disable-next-line
  const [geolocationEnable, setGeolocationEnable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData
  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({
            ...formData,
            userRef: user.uid,
          })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line
  }, [isMounted])

  if (loading) {
    return <Spinner />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted Price needs to be less than regular price')

      return
    }

    if (images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    let geolocation = {}
    let location

    if (geolocationEnable) {
      const params = {
        access_key: process.env.REACT_APP_POSITIONSTACK_KEY,
        query: address,
      }

      const res = await axios.get('https://api.positionstack.com/v1/forward', {
        params,
      })
      const data = res.data

      geolocation.lat = data.data[0]?.latitude ?? 0
      geolocation.lng = data.data[0]?.longitude ?? 0

      location = data.data[0] ? data.data[0]?.label : undefined

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
      location = address
    }

    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/' + fileName)

        const uploadTask = uploadBytesResumable(storageRef, image)

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

    delete formDataCopy.images
    delete formDataCopy.address
    formDataCopy.location = address

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)

    setLoading(false)

    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    let bool = null

    if (e.target.value === 'true') {
      bool = true
    }

    if (e.target.value === 'false') {
      bool = false
    }

    // Files
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: e.target.files,
      }))
    }

    // text
    if (!e.target.files) {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: bool ?? e.target.value,
      }))
    }
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          {/* Form */}
          {/* Sell or Rent */}
          <label className='formLabel'>Sell/Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          {/* Name */}
          <label className='formLabel'>Name</label>
          <input
            type='text'
            className='formInputName'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='4'
            required
          />
          {/* Bedrooms & Bathrooms */}
          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                required
              />
            </div>
          </div>

          {/* Parking Spot */}
          <label className='formLabel'>Parking Spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* Furnished */}
          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* Address */}
          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnable && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  type='text'
                  className='formInputSmall'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  type='text'
                  className='formInputSmall'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          {/* Offer */}
          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* Regular Price */}
          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {/* Discounted Price */}
          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          {/* Image */}
          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />

          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
          {/* End Form */}
        </form>
      </main>
    </div>
  )
}

export default CreateListing
