import { useState, useEffect, useMemo } from "react";
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
import { useLocation } from "react-router-dom";
import {
  Container,
  Grid2,
  Typography,
  Tab,
  Tabs,
  Box,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import PhotoCard from "../components/PhotoCard";

const categoryMap = {
  amphibian: "양서류",
  plant: "식물",
  benthicOrganism: "저서생물",
  insect: "곤충",
  bird: "조류",
  mammal: "포유류",
};

const fetchPhotos = async ({ pageParam = null, isReviewed, category }) => {
  const pageSize = 20;
  let baseQuery = query(
    collection(db, "photos"),
    where("isReviewed", "==", isReviewed),
    orderBy("timestamp", "desc")
  );

  if (category) {
    baseQuery = query(baseQuery, where("category", "==", category));
  }

  let finalQuery = query(baseQuery, limit(pageSize));

  if (pageParam) {
    finalQuery = query(finalQuery, startAfter(pageParam));
  }

  const querySnapshot = await getDocs(finalQuery);
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

  const photos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { photos, lastVisible, hasMore: photos.length === pageSize };
};

function HomePage() {
  const [activeTab, setActiveTab] = useState("unreviewed");
  const [sortBy, setSortBy] = useState("timestamp");
  const [category, setCategory] = useState("");
  const location = useLocation();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ["photos", activeTab, sortBy, category],
    ({ pageParam }) =>
      fetchPhotos({
        pageParam,
        isReviewed: activeTab === "reviewed",
        sortBy,
        category,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.lastVisible : undefined,
    }
  );

  useEffect(() => {
    refetch();
  }, [location, refetch, activeTab, sortBy, category]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const photos = useMemo(() => {
    return data ? data.pages.flatMap((page) => page.photos) : [];
  }, [data]);

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;

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
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel id="category-select-label">카테고리</InputLabel>
          <Select
            labelId="category-select-label"
            value={category}
            label="카테고리"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">전체</MenuItem>
            {Object.entries(categoryMap).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            <PhotoCard photo={photo} categoryMap={categoryMap} />
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
