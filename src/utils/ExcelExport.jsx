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

export const exportReviewedDataToExcel = async () => {
  try {
    const q = query(collection(db, "photos"), where("isReviewed", "==", true));
    const querySnapshot = await getDocs(q);

    const categoryData = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!categoryData[data.category]) {
        categoryData[data.category] = [];
      }
      categoryData[data.category].push({
        WKT: `POINT(${data.photos[0].longitude} ${data.photos[0].latitude})`,
        Name: data.name,
        Description: data.additionalInfo || data.name,
      });
    });

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
