import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseApp from "../firebaseConfig"; // Adjust the path to your Firebase config file
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardPanel from "../components/Dashboard/DashboardPanel";
import SideRoutes from "../components/SideRoutes"; // Make sure to import SideRoutes

const Orders = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [navHeader, setNavHeader] = useState("Dashboard"); // Initialize navHeader state
  
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            setError("No user is currently logged in.");
            setLoading(false);
            return;
          }
  
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, [auth, db]);
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
  
    return (
      <>
        {userData && (
          <DashboardHeader
            navHead={navHeader} // Pass the navHeader state here
            user={{
              userName: userData.firstName,
              fullName: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              department: userData.department, // Added department here
            }}
          />
        )}
        <div className="flex">
          <SideRoutes isMinimized={false} setNavHeader={setNavHeader} />
        </div>
      </>
    );
}

export default Orders