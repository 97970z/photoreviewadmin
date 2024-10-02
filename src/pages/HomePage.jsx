// import { useState } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   limit,
//   startAfter,
// } from "firebase/firestore";
// import { db } from "../services/firebase";
// import { useInfiniteQuery } from "react-query";
// import {
//   Container,
//   Grid,
//   Typography,
//   Tab,
//   Tabs,
//   Card,
//   CardContent,
//   CardMedia,
//   CardActionArea,
//   Box,
//   CircularProgress,
//   Button,
// } from "@mui/material";
// import { styled } from "@mui/system";
// import { Link } from "react-router-dom";

// const StyledCard = styled(Card)(() => ({
//   height: "100%",
//   display: "flex",
//   flexDirection: "column",
//   transition: "transform 0.15s ease-in-out",
//   "&:hover": { transform: "scale3d(1.05, 1.05, 1)" },
// }));

// const fetchPhotos = async ({ pageParam = null, isReviewed }) => {
//   const pageSize = 9; // 한 페이지당 9개의 항목
//   let q = query(
//     collection(db, "photos"),
//     where("isReviewed", "==", isReviewed),
//     orderBy("timestamp", "desc"),
//     limit(pageSize)
//   );

//   if (pageParam) {
//     q = query(q, startAfter(pageParam));
//   }

//   const querySnapshot = await getDocs(q);
//   const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

//   const photos = querySnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));

//   return { photos, lastVisible };
// };

// function HomePage() {
//   const [activeTab, setActiveTab] = useState("unreviewed");

//   const {
//     data,
//     isLoading,
//     error,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInfiniteQuery(
//     ["photos", activeTab],
//     ({ pageParam }) =>
//       fetchPhotos({ pageParam, isReviewed: activeTab === "reviewed" }),
//     {
//       getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
//       staleTime: 5 * 60 * 1000, // 5분
//     }
//   );

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//   };

//   if (isLoading) return <CircularProgress />;
//   if (error)
//     return <Typography color="error">Error: {error.message}</Typography>;

//   const photos = data ? data.pages.flatMap((page) => page.photos) : [];

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4" component="h1" gutterBottom>
//         사진 관리 대시보드
//       </Typography>
//       <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
//         <Tabs
//           value={activeTab}
//           onChange={handleTabChange}
//           aria-label="photo review tabs"
//         >
//           <Tab label="미검토" value="unreviewed" />
//           <Tab label="검토완료" value="reviewed" />
//         </Tabs>
//       </Box>
//       <Grid container spacing={4}>
//         {photos.map((photo) => (
//           <Grid item key={photo.id} xs={12} sm={6} md={4}>
//             <CardActionArea component={Link} to={`/photo/${photo.id}`}>
//               <StyledCard>
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={photo.photos[0].url}
//                   alt={photo.name}
//                 />
//                 <CardContent>
//                   <Typography gutterBottom variant="h6" component="div">
//                     {photo.name}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     업로드: {photo.timestamp.toDate().toLocaleString()}
//                   </Typography>
//                 </CardContent>
//               </StyledCard>
//             </CardActionArea>
//           </Grid>
//         ))}
//       </Grid>
//       {hasNextPage && (
//         <Box sx={{ mt: 4, textAlign: "center" }}>
//           <Button
//             variant="contained"
//             onClick={() => fetchNextPage()}
//             disabled={isFetchingNextPage}
//           >
//             {isFetchingNextPage ? "로딩 중..." : "더 보기"}
//           </Button>
//         </Box>
//       )}
//     </Container>
//   );
// }

// export default HomePage;

import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useInfiniteQuery } from "react-query";
import {
  Container,
  Grid2,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";

const StyledCard = styled(Card)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.15s ease-in-out",
  "&:hover": { transform: "scale3d(1.05, 1.05, 1)" },
}));

const fetchPhotos = async ({ pageParam = null, isReviewed }) => {
  const pageSize = 9; // 한 페이지당 9개의 항목
  let q = query(
    collection(db, "photos"),
    where("isReviewed", "==", isReviewed),
    orderBy("timestamp", "desc"),
    limit(pageSize)
  );

  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }

  const querySnapshot = await getDocs(q);
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

  const photos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { photos, lastVisible };
};

function HomePage() {
  const [activeTab, setActiveTab] = useState("unreviewed");
  const [sortBy, setSortBy] = useState("timestamp");

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ["photos", activeTab, sortBy],
    ({ pageParam }) =>
      fetchPhotos({ pageParam, isReviewed: activeTab === "reviewed", sortBy }),
    {
      getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
      staleTime: 5 * 60 * 1000, // 5분
    }
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    refetch();
  };

  const sortPhotos = (photos, sortBy) => {
    return [...photos].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return b.timestamp.seconds - a.timestamp.seconds;
      }
    });
  };

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;

  const photos = data
    ? sortPhotos(
        data.pages.flatMap((page) => page.photos),
        sortBy
      )
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        사진 관리 대시보드
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="photo review tabs"
        >
          <Tab label="미검토" value="unreviewed" />
          <Tab label="검토완료" value="reviewed" />
        </Tabs>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">정렬</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="정렬"
            onChange={handleSortChange}
          >
            <MenuItem value="timestamp">업로드 날짜순</MenuItem>
            <MenuItem value="name">이름순</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid2 container spacing={4}>
        {photos.map((photo) => (
          <Grid2 item key={photo.id} xs={12} sm={6} md={4}>
            <CardActionArea component={Link} to={`/photo/${photo.id}`}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.photos[0].url}
                  alt={photo.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {photo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    업로드: {photo.timestamp.toDate().toLocaleString()}
                  </Typography>
                </CardContent>
              </StyledCard>
            </CardActionArea>
          </Grid2>
        ))}
      </Grid2>
      {hasNextPage && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default HomePage;
