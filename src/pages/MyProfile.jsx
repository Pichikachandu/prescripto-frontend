import React, { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit2, FiSave, FiX, FiUpload } from 'react-icons/fi';

const MyProfile = () => {
  const { userData, setUserData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/get-profile`,
        {
          withCredentials: true,
          headers: {
            'token': token
          }
        }
      );
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          ...response.data.user,
          // Ensure address is an object with at least an empty object
          address: response.data.user.address || { line1: '', line2: '' }
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/upload-profile-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            'token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          image: response.data.imageUrl
        }));
        toast.success('Profile image updated successfully');
      }
      return response.data.success;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    await handleImageUpload(file);
    // Reset the file input
    e.target.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update-profile`,
        userData,
        {
          withCredentials: true,
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Fetch the updated user data
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get-profile`,
          {
            withCredentials: true,
            headers: { 'token': token }
          }
        );
        
        if (profileResponse.data.success) {
          setUserData(prev => ({
            ...prev,
            ...profileResponse.data.user,
            address: profileResponse.data.user.address || { line1: '', line2: '' }
          }));
        }
        
        toast.success('Profile updated successfully');
        setIsEdit(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?._id) {
      fetchUserProfile();
    }
  }, []);

  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      <div className='relative inline-block group'>
        <div className='relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mt-4'>
          <img 
            className='w-full h-full object-cover' 
            src={userData.image || '/default-avatar.png'} 
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
          {isUploading && (
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
            </div>
          )}
        </div>
        {isEdit && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp, image/jpg"
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-all shadow-md"
              title="Change profile picture"
            >
              <FiUpload size={16} className={isUploading ? 'opacity-50' : ''} />
            </button>
          </>
        )}
      </div>
      {isEdit ? (
        <input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
          type="text"
          value={userData.name}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      )}
      <hr className='bg-zinc-400 h-[1px] border-none' />
      <div>
        <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='  font-medium '>Phone:</p>
          {isEdit ? 
            <input className='bg-gray-100 max-w-52'
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
           : 
            <p className='text-blue-400'>{userData.phone}</p>
          }
          <p className='font-medium'>Address:</p>
          {
            isEdit
              ? <p>
                <input 
                  className='bg-gray-50 w-full p-1 border rounded' 
                  onChange={(e) => setUserData(prev => ({ 
                    ...prev, 
                    address: { 
                      ...(prev.address || {}), 
                      line1: e.target.value 
                    } 
                  }))} 
                  value={userData.address?.line1 || ''} 
                  type="text" 
                  placeholder="Address Line 1"
                />
                <br />
                <input 
                  className='bg-gray-50 w-full p-1 border rounded mt-1' 
                  onChange={(e) => setUserData(prev => ({ 
                    ...prev, 
                    address: { 
                      ...(prev.address || {}), 
                      line2: e.target.value 
                    } 
                  }))} 
                  value={userData.address?.line2 || ''} 
                  type="text" 
                  placeholder="Address Line 2 (Optional)"
                />
              </p>
              : <p className='text-gray-500'>
                {userData.address?.line1 || 'No address provided'}
                {userData.address?.line2 && <>
                  <br />
                  {userData.address.line2}
                </>}
              </p>
          }
        </div>
      </div>
      <div>
        <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {isEdit ? (
            <select className='max-w-20 bg-gray-100' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="transgender">transgender</option>
            </select>
          ) : (
            <p className='text-gray-400'>{userData.gender}</p>
          )}
          <p className='font-medium'>Birthday:</p>
          {
            isEdit
            ? <input className='max-w-28 bg-gray-100' type='date' onChange={(e)=> setUserData(prev=>({ ...prev,dob: e.target.value}))} value={userData.dob}/>
            : <p className='text-gray-400'>{userData.dob}</p>
          }
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      <div className='mt-10 flex gap-4'>
        {isLoading || isUploading ? (
          <button 
            className='flex items-center gap-2 border border-primary px-6 py-2 rounded-full bg-primary text-white opacity-75 cursor-not-allowed'
            disabled
          >
            {isUploading ? 'Uploading...' : 'Saving...'}
          </button>
        ) : isEdit ? (
          <>
            <button 
              className='flex items-center gap-2 border border-primary px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all'
              onClick={handleSave}
            >
              <FiSave /> Save
            </button>
            <button 
              className='flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-50 transition-all'
              onClick={() => setIsEdit(false)}
            >
              <FiX /> Cancel
            </button>
          </>
        ) : (
          <button 
            className='flex items-center gap-2 border border-primary px-6 py-2 rounded-full bg-white text-primary hover:bg-gray-50 transition-all'
            onClick={() => setIsEdit(true)}
          >
            <FiEdit2 /> Edit Information
          </button>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default MyProfile;
