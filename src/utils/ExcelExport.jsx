// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "../services/firebase";
// import * as XLSX from "xlsx";

// const categoryMap = {
//   amphibian: "양서류",
//   plant: "식물",
//   benthicOrganism: "저서생물",
//   insect: "곤충",
//   bird: "조류",
//   mammal: "포유류",
// };

// export const exportReviewedDataToExcel = async () => {
//   try {
//     const q = query(collection(db, "photos"), where("isReviewed", "==", true));
//     const querySnapshot = await getDocs(q);

//     const categoryData = {};

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       if (!categoryData[data.category]) {
//         categoryData[data.category] = [];
//       }
//       categoryData[data.category].push({
//         WKT: `POINT(${data.photos[0].longitude} ${data.photos[0].latitude})`,
//         Name: data.name,
//         Description: data.name,
//       });
//     });

//     Object.entries(categoryData).forEach(([category, data]) => {
//       const ws = XLSX.utils.json_to_sheet(data);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

//       // 첫 번째 행에 열 제목 추가
//       XLSX.utils.sheet_add_aoa(ws, [["WKT", "이름", "설명"]], {
//         origin: "A1",
//       });

//       const fileName = `${
//         categoryMap[category] || category
//       }_reviewed_data.xlsx`;
//       XLSX.writeFile(wb, fileName);
//     });

//     console.log("Excel files have been created successfully.");
//   } catch (error) {
//     console.error("Error exporting data to Excel:", error);
//   }
// };

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import * as XLSX from "xlsx";

const categoryMap = {
  amphibian: "양서류",
  plant: "식물",
  benthicOrganism: "저서생물",
  insect: "곤충",
  bird: "조류",
  mammal: "포유류",
};

async function getWikipediaDescription(title) {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(
    title
  )}&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract;

    // 추출된 내용이 없거나 "관련 문서" 등의 메시지가 포함된 경우 기본 제목을 반환
    if (!extract || extract.includes("다음은 관련된 주제에 관한 문서입니다")) {
      return title;
    }

    // 첫 문장만 반환 (최대 200자)
    const firstSentence = extract.split(".")[0] + ".";
    return firstSentence.length > 200
      ? firstSentence.substring(0, 200) + "..."
      : firstSentence;
  } catch (error) {
    console.error("Error fetching Wikipedia description:", error);
    return title; // 에러 발생 시 기본 제목 반환
  }
}

export const exportReviewedDataToExcel = async () => {
  try {
    const q = query(collection(db, "photos"), where("isReviewed", "==", true));
    const querySnapshot = await getDocs(q);

    const categoryData = {};

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (!categoryData[data.category]) {
        categoryData[data.category] = [];
      }

      const description = await getWikipediaDescription(data.name);

      categoryData[data.category].push({
        WKT: `POINT(${data.photos[0].longitude} ${data.photos[0].latitude})`,
        Name: data.name,
        Description: description,
      });
    }

    Object.entries(categoryData).forEach(([category, data]) => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // 첫 번째 행에 열 제목 추가
      XLSX.utils.sheet_add_aoa(ws, [["WKT", "Name", "Description"]], {
        origin: "A1",
      });

      const fileName = `${
        categoryMap[category] || category
      }_reviewed_data.xlsx`;
      XLSX.writeFile(wb, fileName);
    });

    console.log("Excel files have been created successfully.");
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
  }
};
