import React, { useEffect, useRef, useState } from 'react';
import { Camera, Edit, Mail, Save, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { EditingModes } from '../lib/constants';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { format } from 'date-fns';

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editingMode, setEditingMode] = useState(EditingModes.VIEW);
  const nameRef = useRef(null);

  const [compressionProgress, setCompressionProgress] = useState(0);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          onProgress: (progress) => setCompressionProgress(progress),
        };

        const compressedFile = await imageCompression(file, options);
        setSelectedImage(URL.createObjectURL(compressedFile));
        setImageFile(compressedFile);
        setCompressionProgress(0);
      } catch (error) {
        toast.error('Error compressing image');
        console.error(error);
        setCompressionProgress(0);
      }
    }
  };

  const handleEditingModeToggle = async (mode) => {
    if (mode === EditingModes.EDIT) {
      setEditingMode(EditingModes.EDIT);
    }
    if (mode === EditingModes.SAVE) {
      const newName = nameRef.current.textContent;
      if (!imageFile && newName === authUser?.fullName) {
        toast.success('No changes made!');
        setEditingMode(EditingModes.VIEW);
        return;
      }

      await updateProfile(imageFile, newName);
      setImageFile(null);
      setSelectedImage(null);
      setEditingMode(EditingModes.VIEW);
    }
  };

  return (
    <div className='h-screen pt-20'>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>
          {editingMode === EditingModes.EDIT && (
            <button onClick={() => handleEditingModeToggle(EditingModes.SAVE)}>
              <Save />
            </button>
          )}
          {editingMode === EditingModes.VIEW && (
            <button onClick={() => handleEditingModeToggle(EditingModes.EDIT)}>
              <Edit />
            </button>
          )}
          <div className='text-center'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='mt-2'>Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <img
                src={
                  selectedImage ||
                  authUser.avatar ||
                  `https://robohash.org/${authUser.id}.png`
                }
                alt='Profile'
                className={`size-32 rounded-full object-cover border-4 transition-all duration-200 ${
                  editingMode === EditingModes.EDIT
                    ? 'border-primary shadow-lg shadow-primary/30'
                    : 'border-base-content/10'
                }`}
              />
              {editingMode === EditingModes.EDIT && (
                <label
                  htmlFor='avatar-upload'
                  className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''
                  }
                `}>
                  <Camera className='w-5 h-5 text-base-200' />
                  <input
                    type='file'
                    id='avatar-upload'
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              )}
            </div>
            {editingMode === EditingModes.EDIT && (
              <div className='text-sm text-zinc-400'>
                {(isUpdatingProfile || compressionProgress > 0) && (
                  <div className='w-full max-w-xs'>
                    <progress
                      className='progress progress-primary w-full'
                      value={
                        compressionProgress || (isUpdatingProfile ? 100 : 0)
                      }
                      max='100'
                    />
                    <p className='text-sm text-center mt-1'>
                      {compressionProgress > 0
                        ? `Compressing: ${Math.round(compressionProgress)}%`
                        : 'Uploading...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='space-y-6'>
            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-400 flex items-center gap-2'>
                <User className='w-4 h-4' />
                Full Name
              </div>
              <p
                ref={nameRef}
                className={`px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                  editingMode === EditingModes.EDIT
                    ? 'bg-base-100 border-primary shadow-sm outline-primary/50 hover:outline focus:outline outline-2 outline-offset-2'
                    : 'bg-base-200 border-base-content/10'
                }`}
                contentEditable={editingMode === EditingModes.EDIT}
                suppressContentEditableWarning={true}>
                {isUpdatingProfile ? <em>Updating...</em> : authUser?.fullName}
              </p>
            </div>

            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-400 flex items-center gap-2'>
                <Mail className='w-4 h-4' />
                Email Address
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>
                {authUser?.email}
              </p>
            </div>
          </div>
          <div className='mt-6 bg-base-300 rounded-xl p-6'>
            <h2 className='text-lg font-medium  mb-4'>Account Information</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between py-2 border-b border-zinc-700'>
                <span>Member Since</span>
                <span>
                  {authUser.createdAt
                    ? format(new Date(authUser.createdAt), 'MMMM d, yyyy')
                    : '-'}
                </span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span>Account Status</span>
                <span className='text-green-500'>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
