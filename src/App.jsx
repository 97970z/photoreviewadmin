// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import DetailPage from "./pages/DetailPage";
// import Header from "./components/Header";

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Header />
//         <Routes>
//           <Route exact path="/" element={<HomePage />} />
//           <Route path="/photo/:id" element={<DetailPage />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import Header from "./components/Header";

const queryClient = new QueryClient({
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
              <Route exact path="/" element={<HomePage />} />
              <Route path="/photo/:id" element={<DetailPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
