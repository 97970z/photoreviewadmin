import { useState } from "react";
import { useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
  arrayRemove,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, deletePhotoAndData, storage } from "../services/firebase";
import PhotoDetail from "../components/Detail/PhotoDetail";
import { queryClient } from "../App";

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: photo,
    isLoading,
    error,
    refetch,
  } = useQuery(["photo", id], async () => {
    const docRef = doc(db, "photos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error("Photo not found");
  });

  const { data: prevNextData } = useQuery(
    ["prevNext", id],
    async () => {
      if (!photo) return { prevId: null, nextId: null };

      const photosRef = collection(db, "photos");
      const prevQuery = query(
        photosRef,
        orderBy("timestamp", "desc"),
        endBefore(photo.timestamp),
        limit(1)
      );
      const nextQuery = query(
        photosRef,
        orderBy("timestamp", "desc"),
        startAfter(photo.timestamp),
        limit(1)
      );

      const [prevSnapshot, nextSnapshot] = await Promise.all([
        getDocs(prevQuery),
        getDocs(nextQuery),
      ]);

      const prevId = prevSnapshot.docs[0]?.id || null;
      const nextId = nextSnapshot.docs[0]?.id || null;

      return { prevId, nextId };
    },
    {
      enabled: !!photo,
    }
  );

  const handleReview = async (additionalInfo) => {
    const docRef = doc(db, "photos", id);
    await updateDoc(docRef, { isReviewed: true, additionalInfo });
    refetch();
    queryClient.invalidateQueries("photos");
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    if (photo) {
      const photoUrls = photo.photos.map((p) => p.url);
      const isDeleted = await deletePhotoAndData(id, photoUrls);
      if (isDeleted) {
        queryClient.invalidateQueries("photos");
        navigate("/");
      } else {
        alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleCancelReview = async () => {
    const docRef = doc(db, "photos", id);
    await updateDoc(docRef, { isReviewed: false, additionalInfo: "" });
    refetch();
    queryClient.invalidateQueries("photos");
  };

  const handleUpdateInfo = async (additionalInfo) => {
    const docRef = doc(db, "photos", id);
    await updateDoc(docRef, { additionalInfo });
    refetch();
    queryClient.invalidateQueries("photos");
  };

  const handleRemovePhoto = async (index) => {
    try {
      const docRef = doc(db, "photos", id);
      const photoToRemove = photo.photos[index];

      // Firebase Storage에서 사진 파일 삭제
      const storageRef = ref(storage, photoToRemove.url);
      await deleteObject(storageRef);

      // Firestore에서 사진 정보 제거
      await updateDoc(docRef, {
        photos: arrayRemove(photoToRemove),
      });

      // 로컬 상태 및 쿼리 캐시 업데이트
      refetch();
      queryClient.invalidateQueries("photos");

      return true; // 제거 성공
    } catch (error) {
      console.error("Error removing photo:", error);
      return false; // 제거 실패
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;
  if (!photo) return <Typography>Photo not found</Typography>;

  return (
    <>
      <PhotoDetail
        photo={photo}
        prevId={prevNextData?.prevId}
        nextId={prevNextData?.nextId}
        onReview={handleReview}
        onCancelReview={handleCancelReview}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onUpdateInfo={handleUpdateInfo}
        onRemovePhoto={handleRemovePhoto}
      />
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>사진 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 사진을 정말로 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DetailPage;
