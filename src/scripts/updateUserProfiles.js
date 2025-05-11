import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import firebaseApp from "../firebaseConfig";

/**
 * This script updates existing user profiles with new fields
 * Run this script once to add the new fields to all existing users
 */
const updateUserProfiles = async () => {
  const db = getFirestore(firebaseApp);

  try {
    console.log("Starting user profile update...");

    // Get all users
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    if (usersSnapshot.empty) {
      console.log("No users found in the collection");
      return;
    }

    // Update each user with new fields if they don't exist
    const updatePromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Define default values for new fields
      const updates = {};

      // Add dateOfBirth if it doesn't exist
      if (!userData.dateOfBirth) {
        updates.dateOfBirth = "";
      }

      // Add gender if it doesn't exist
      if (!userData.gender) {
        updates.gender = "";
      }

      // Add address if it doesn't exist
      if (!userData.address) {
        updates.address = "";
      }

      // Add phoneNumber if it doesn't exist
      if (!userData.phoneNumber) {
        updates.phoneNumber = "";
      }

      // Add social media links if they don't exist
      if (!userData.facebook) {
        updates.facebook = "";
      }

      if (!userData.instagram) {
        updates.instagram = "";
      }

      if (!userData.linkedin) {
        updates.linkedin = "";
      }

      // Add profilePicture if it doesn't exist
      if (!userData.profilePicture) {
        updates.profilePicture = "";
      }

      // Add additionalInfoCompleted if it doesn't exist
      if (userData.additionalInfoCompleted === undefined) {
        // If user already has a PIN, mark as completed
        updates.additionalInfoCompleted = userData.pin ? true : false;
      }

      // Add hasCompletedInitialSetup if it doesn't exist
      if (userData.hasCompletedInitialSetup === undefined) {
        // If user already has a PIN, mark as completed
        updates.hasCompletedInitialSetup = userData.pin ? true : false;
      }

      // Only update if there are fields to update
      if (Object.keys(updates).length > 0) {
        console.log(`Updating user ${userId} with new fields:`, updates);
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, updates);
        return true;
      }

      return false;
    });

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(result => result).length;

    console.log(`User profile update complete. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error("Error updating user profiles:", error);
  }
};

export default updateUserProfiles;
