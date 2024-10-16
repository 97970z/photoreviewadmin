import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box, Container, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import TrailsPage from "./pages/TrailsPage";
import Header from "./components/Header";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 30 * 60 * 1000, // 30분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/photo/:id" element={<DetailPage />} />
                <Route path="/trails" element={<TrailsPage />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
