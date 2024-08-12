import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import axios from "axios";

const MandalaChart = () => {
  const initialChart = Array(9)
    .fill()
    .map(() => Array(9).fill(""));
  const [chart, setChart] = useState(initialChart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newChart = [...chart];
    [0, 1, 2, 3, 5, 6, 7, 8].forEach((i) => {
      newChart[i][4] = chart[4][i];
    });
    setChart(newChart);
  }, [
    chart[4][0],
    chart[4][1],
    chart[4][2],
    chart[4][3],
    chart[4][5],
    chart[4][6],
    chart[4][7],
    chart[4][8],
  ]);

  const handleCellChange = (outerIndex, innerIndex, value) => {
    const newChart = [...chart];
    newChart[outerIndex][innerIndex] = value;
    setChart(newChart);
  };

  const API_URL = process.env.REACT_APP_API_URL;

  const generateSubtopics = async (centerTopic) => {
    console.log(API_URL);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/generate-mandala`, {
        centerTopic,
      });
      return response.data.subtopics;
    } catch (error) {
      console.error("Error generating subtopics:", error);
      setError(
        "サブトピックの生成中にエラーが発生しました。もう一度お試しください。"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const simulateAICompletionForGrid = async (gridIndex) => {
    const centerText = chart[gridIndex][4];
    if (!centerText) return;

    const subtopics = await generateSubtopics(centerText);
    if (!subtopics) return;

    const newChart = [...chart];
    subtopics.forEach((subtopic, index) => {
      const i = [0, 1, 2, 3, 5, 6, 7, 8][index];
      if (gridIndex === 4) {
        // 中央グリッドの場合、他のグリッドの中心にも反映
        newChart[i][4] = subtopic;
      }
      newChart[gridIndex][i] = subtopic;
    });
    setChart(newChart);
  };

  const renderCell = (outerIndex, innerIndex) => {
    const isCenterOfCenter = outerIndex === 4 && innerIndex === 4;
    const isSubCenter = outerIndex !== 4 && innerIndex === 4;
    const isCentralSubtheme = outerIndex === 4 && innerIndex !== 4;

    let bgColor = "bg-white";
    let textColor = "text-gray-800";

    if (isCenterOfCenter) {
      bgColor = "bg-blue-200";
      textColor = "text-blue-800";
    } else if (isSubCenter || isCentralSubtheme) {
      bgColor = "bg-blue-100";
      textColor = "text-blue-600";
    }

    return (
      <textarea
        key={`${outerIndex}-${innerIndex}`}
        value={chart[outerIndex][innerIndex]}
        onChange={(e) =>
          handleCellChange(outerIndex, innerIndex, e.target.value)
        }
        className={`w-full h-full p-1 text-xs resize-none border-none ${bgColor} ${textColor} ${
          isCenterOfCenter ? "font-bold text-sm" : ""
        } ${
          isSubCenter || isCentralSubtheme ? "font-semibold" : ""
        } text-center`}
        readOnly={isSubCenter && outerIndex !== 4}
        rows={3}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      />
    );
  };

  const renderSubGrid = (index) => {
    return (
      <div key={index} className="relative">
        <div className="grid grid-cols-3 gap-px bg-gray-300">
          {Array(9)
            .fill()
            .map((_, i) => renderCell(index, i))}
        </div>
        {index !== 4 && (
          <Button
            onClick={() => simulateAICompletionForGrid(index)}
            className="absolute top-0 right-0 text-xs p-1"
            size="sm"
            disabled={loading}
          >
            AI
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Card className="max-w-5xl mx-auto bg-white">
        <CardContent className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
            マンダラチャート
          </h1>
          <div className="grid grid-cols-3 gap-1 bg-blue-300 p-1">
            {Array(9)
              .fill()
              .map((_, i) => renderSubGrid(i))}
          </div>
          <Button
            onClick={() => simulateAICompletionForGrid(4)}
            className="mt-4 w-full"
            disabled={loading}
          >
            {loading ? "AI生成中..." : "中央グリッドのAI自動入力を実行"}
          </Button>
          {error && <p className="mt-2 text-red-500 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default MandalaChart;
