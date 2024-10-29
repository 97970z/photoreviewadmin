/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { Paper, Typography, Grid2, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import _ from "lodash";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const StatisticsCard = ({ title, children }) => (
  <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </Paper>
);

const TrailStatistics = ({ trails }) => {
  const statistics = useMemo(() => {
    // 날짜별 산책 횟수
    const getDate = (timestamp) => {
      if (!timestamp) return new Date();
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp.toDate === "function") return timestamp.toDate();
      return new Date(timestamp);
    };

    const dailyWalks = _.groupBy(trails, (trail) =>
      format(getDate(trail.timestamp), "yyyy-MM-dd")
    );
    const walksByDate = Object.entries(dailyWalks)
      .map(([date, walks]) => ({
        date,
        count: walks.length,
        totalDistance: _.sumBy(walks, "distance"),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 시간대별 산책 분포
    const hourlyDistribution = _.countBy(trails, (trail) => {
      const startTime = getDate(trail.startTime);
      return startTime.getHours();
    });
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}시`,
      count: hourlyDistribution[hour] || 0,
    }));

    // 평균 산책 거리와 시간
    const totalDistance = _.sumBy(trails, "distance");
    const averageDistance = totalDistance / trails.length;

    const walkDurations = trails.map((trail) => {
      const start = getDate(trail.startTime);
      const end = getDate(trail.endTime);
      return start && end ? (end - start) / (1000 * 60) : 0; // minutes
    });
    const averageDuration = _.mean(walkDurations);

    // 거리별 분포
    const distanceRanges = {
      "1km 미만": 0,
      "1-2km": 0,
      "2-3km": 0,
      "3-4km": 0,
      "4km 이상": 0,
    };
    trails.forEach((trail) => {
      if (trail.distance < 1) distanceRanges["1km 미만"]++;
      else if (trail.distance < 2) distanceRanges["1-2km"]++;
      else if (trail.distance < 3) distanceRanges["2-3km"]++;
      else if (trail.distance < 4) distanceRanges["3-4km"]++;
      else distanceRanges["4km 이상"]++;
    });
    const distanceDistribution = Object.entries(distanceRanges).map(
      ([range, count]) => ({
        range,
        count,
      })
    );

    // 사용자별 총 거리
    const userDistances = _(trails)
      .groupBy("name")
      .map((userTrails, name) => ({
        name: name || "이름 없음",
        totalDistance: _.sumBy(userTrails, "distance"),
      }))
      .value();

    return {
      walksByDate,
      hourlyData,
      averageDistance,
      averageDuration,
      distanceDistribution,
      userDistances,
      totalWalks: trails.length,
      totalDistance,
    };
  }, [trails]);

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Summary Cards */}
      <Grid2 container spacing={3}>
        <Grid2 item xs={12} sm={6} md={3}>
          <StatisticsCard title="총 산책 횟수">
            <Typography variant="h4" color="primary">
              {statistics.totalWalks}회
            </Typography>
          </StatisticsCard>
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <StatisticsCard title="총 산책 거리">
            <Typography variant="h4" color="primary">
              {statistics.totalDistance.toFixed(1)}km
            </Typography>
          </StatisticsCard>
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <StatisticsCard title="평균 산책 거리">
            <Typography variant="h4" color="primary">
              {statistics.averageDistance.toFixed(1)}km
            </Typography>
          </StatisticsCard>
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <StatisticsCard title="평균 산책 시간">
            <Typography variant="h4" color="primary">
              {Math.round(statistics.averageDuration)}분
            </Typography>
          </StatisticsCard>
        </Grid2>
      </Grid2>

      {/* Charts */}
      <Grid2 container spacing={3}>
        <Grid2 item xs={12} md={6}>
          <StatisticsCard title="일별 산책 통계">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={statistics.walksByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="산책 횟수"
                />
                <Line
                  type="monotone"
                  dataKey="totalDistance"
                  stroke="#82ca9d"
                  name="총 거리(km)"
                />
              </LineChart>
            </ResponsiveContainer>
          </StatisticsCard>
        </Grid2>

        <Grid2 item xs={12} md={6}>
          <StatisticsCard title="시간대별 산책 분포">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="산책 횟수" />
              </BarChart>
            </ResponsiveContainer>
          </StatisticsCard>
        </Grid2>

        <Grid2 item xs={12} md={6}>
          <StatisticsCard title="거리별 산책 분포">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statistics.distanceDistribution}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statistics.distanceDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </StatisticsCard>
        </Grid2>

        <Grid2 item xs={12} md={6}>
          <StatisticsCard title="사용자별 총 산책 거리">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.userDistances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="totalDistance"
                  fill="#82ca9d"
                  name="총 거리(km)"
                />
              </BarChart>
            </ResponsiveContainer>
          </StatisticsCard>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default TrailStatistics;
