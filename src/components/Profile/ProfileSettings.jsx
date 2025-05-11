import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import firebaseApp from '../../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineAddAPhoto, MdEdit, MdDelete, MdSave, MdCancel, MdOutlineAccountCircle } from 'react-icons/md';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    contactNumber: '',
    bio: '',
    profilePicture: null,
  });

  const { currentUser } = useAuth();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const modalRef = useRef(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    // Handle escape key to close modal
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showDeleteConfirm]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setError('No user is currently logged in.');
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

          // Set user data from Firestore
          const userData = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            department: data.department || '',
            contactNumber: data.contactNumber || '',
            bio: data.bio || '',
            profilePicture: data.profilePicture || null,
          };

          setUserData(userData);

          // Set profile picture preview if it exists
          if (data.profilePicture) {
            setPreviewUrl(data.profilePicture);
          }
        } else {
          setError('User data not found.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    // Resize and convert image to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Set canvas dimensions and draw resized image
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 data URL (JPEG format with 0.8 quality to reduce size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Set the preview and store the base64 string
        setPreviewUrl(dataUrl);
        setImageFile(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Clear any previous errors
    setError('');
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setImageFile(null);
    setPreviewUrl(userData.profilePicture || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show delete confirmation modal
  const confirmDeleteProfilePicture = () => {
    setShowDeleteConfirm(true);
  };

  // Delete profile picture
  const deleteProfilePicture = async () => {
    if (!userData.profilePicture) {
      setShowDeleteConfirm(false);
      return;
    }

    try {
      setSaving(true);

      // Update user document to remove the profile picture
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        profilePicture: null
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        profilePicture: null
      }));
      setPreviewUrl('');
      setSuccess('Profile picture removed successfully!');
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setError('Failed to delete profile picture. Please try again.');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Prepare update data - include first name and last name
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        contactNumber: userData.contactNumber,
        bio: userData.bio,
      };

      // Add profile picture if a new one is selected (base64 string)
      if (imageFile && typeof imageFile === 'string') {
        // Store the base64 string directly in Firestore
        updateData.profilePicture = imageFile;
      }

      // Update the user document
      await updateDoc(userDocRef, updateData);

      // Update local state if profile picture was updated
      if (imageFile) {
        setUserData(prev => ({
          ...prev,
          profilePicture: updateData.profilePicture
        }));
        setImageFile(null);
      }

      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100/30"
      >
        <div className="flex items-center mb-8">
          <div className="bg-amber-100/50 p-2.5 rounded-xl mr-4">
            <MdOutlineAccountCircle className="text-amber-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile Settings</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Profile Picture Section */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 self-start">Profile Picture</h2>

                <div className="relative mb-4 group">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-amber-50 border-4 border-amber-100 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdOutlineAccountCircle className="text-amber-300 text-7xl" />
                    )}
                  </div>

                  {/* Overlay with edit button on hover */}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <MdEdit className="text-amber-500 text-xl" />
                    </button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Image controls */}
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-medium transition-colors border border-amber-200 flex items-center"
                  >
                    <MdOutlineAddAPhoto className="mr-1.5" />
                    {userData.profilePicture || previewUrl ? 'Change Photo' : 'Add Photo'}
                  </button>

                  {(userData.profilePicture || previewUrl) && (
                    <button
                      type="button"
                      onClick={imageFile ? removeSelectedImage : confirmDeleteProfilePicture}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors border border-red-200 flex items-center"
                    >
                      <MdDelete className="mr-1.5" />
                      {imageFile ? 'Cancel' : 'Remove'}
                    </button>
                  )}
                </div>

                {imageFile && (
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <p>New image selected</p>
                    <p>Click Save Changes to update your profile picture</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Information Section */}
            <div className="col-span-2">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Cannot be changed)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department (Cannot be changed)
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={userData.department}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={userData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter your contact number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself"
                    rows="4"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <MdSave className="mr-1.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Delete Profile Picture Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden border border-amber-100"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <MdDelete className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">Remove Profile Picture</h3>
              </div>

              <div className="p-6">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-amber-800">Confirm Removal</h4>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Are you sure you want to remove your profile picture? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors border border-gray-200 hover:border-gray-300 flex items-center"
                  >
                    <MdCancel className="mr-1.5" />
                    Cancel
                  </button>
                  <button
                    onClick={deleteProfilePicture}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors shadow-sm hover:shadow flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <MdDelete className="mr-1.5" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettings;
