import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import PhotoDetail from "../components/PhotoDetail";

function DetailPage() {
  const [photo, setPhoto] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const fetchPhoto = async () => {
    const docRef = doc(db, "photos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setPhoto({ id: docSnap.id, ...docSnap.data() });
    }
  };

  const handleReview = async () => {
    const docRef = doc(db, "photos", id);
    await updateDoc(docRef, { isReviewed: true });
    setPhoto({ ...photo, isReviewed: true });
  };

  if (!photo) return <div>Loading...</div>;

  return <PhotoDetail photo={photo} onReview={handleReview} />;
}

export default DetailPage;
