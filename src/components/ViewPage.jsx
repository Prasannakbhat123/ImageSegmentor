import React, { useState, useEffect } from "react";
import Tools from "./Tools";
import FolderTree from "./FolderTree";
import Preview from "./Preview";
import PolygonList from "./PolygonList";
import logo from '../assets/IGlogo.png';

const ViewPage = ({ uploadedFiles, setViewMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTool, setCurrentTool] = useState('marker');
  const [polygons, setPolygons] = useState({});
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [selectedPolygons, setSelectedPolygons] = useState([]);

  const handleFileSelect = (fileUrl, filePath) => {
    setSelectedFile({
      url: fileUrl,
      path: filePath
    });

    // Clear selected polygon when changing files
    setSelectedPolygon(null);

    // Initialize polygons for this file if not already done
    if (!polygons[fileUrl]) {
      setPolygons(prev => ({
        ...prev,
        [fileUrl]: []
      }));
    }
  };

  const handleProcessPolygons = (processedPolygons) => {
    if (!selectedFile) return;

    setPolygons(prevPolygons => ({
      ...prevPolygons,
      [selectedFile.url]: processedPolygons
    }));
  };

  const handleUpdatePolygons = (updatedPolygons) => {
    setPolygons(prevPolygons => ({
      ...prevPolygons,
      ...updatedPolygons
    }));
  };

  const handlePolygonClick = (polygon) => {
    console.log("Clicked Polygon:", polygon);

    const currentPolygons = polygons[selectedFile?.url] || [];
    const index = currentPolygons.findIndex(p => p.name === polygon.name);

    // Check if the polygon is already in the current polygons list
    if (index === -1) {
      console.log("Adding Polygon to Current Image's List:", polygon);
      const newPolygons = {
        ...polygons,
        [selectedFile?.url]: [...currentPolygons, polygon]
      };

      setPolygons(newPolygons);
    }

    // Check if the polygon is already selected
    const isAlreadySelected = selectedPolygons.some(p => p.name === polygon.name && p.fileUrl === selectedFile?.url);
    if (!isAlreadySelected) {
      console.log("Selecting Polygon:", polygon);
      setSelectedPolygons(prev => [...prev, { ...polygon, fileUrl: selectedFile?.url }]);
    }
    setSelectedPolygon(polygon); // Ensure this polygon is selected
};
  useEffect(() => {
    if (selectedFile) {
      const currentPolygons = polygons[selectedFile?.url] || [];
      const processedPolygons = currentPolygons.map(polygon => ({
        name: polygon.name,
        group: polygon.group,
        points: polygon.points.map(point => [point.x, point.y])
      }));

      console.log("Processed Polygons for Current Image:", JSON.stringify(processedPolygons, null, 2));
    }
  }, [selectedFile, polygons]);

  // Get all polygons as a flat array for the polygon list
  const getAllPolygons = () => {
    const allPolygons = Object.entries(polygons).flatMap(([fileUrl, filePolygons]) =>
      filePolygons.map(polygon => ({
        ...polygon,
        fileUrl
      }))
    );

    // Remove duplicates
    const uniquePolygons = allPolygons.filter((polygon, index, self) =>
      index === self.findIndex(p => p.name === polygon.name)
    );

    return uniquePolygons;
};

  return (
    <div className="relative flex flex-col h-screen">
      <nav className="flex items-center justify-between bg-gray-200 shadow-2xl text-white p-3">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8" />
          <span className="text-xl font-bold text-[#2E3192]">Image Segmenter</span>
        </div>
        <button 
          onClick={() => setViewMode(false)}
          className="border-2 border-[#2E3192] bg-transparent text-[#2E3192] px-4 py-2 rounded-full hover:bg-[#2E3192] hover:text-white transition"
        >
          ← Back
        </button>
      </nav>
      <div className="flex flex-grow">
        <Tools 
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <FolderTree 
          files={uploadedFiles} 
          onFileSelect={handleFileSelect}
        />
        <Preview 
          selectedFile={selectedFile?.url} 
          currentTool={currentTool}
          onProcessPolygons={handleProcessPolygons}
          onUpdatePolygons={handleUpdatePolygons}
          selectedPolygon={selectedPolygon}
          setSelectedPolygon={setSelectedPolygon}
          onPolygonSelection={handleProcessPolygons}
          selectedPolygons={selectedPolygons} 
        />
       <PolygonList 
          polygons={getAllPolygons()} 
          onPolygonClick={handlePolygonClick}
        />
      </div>
    </div>
  );
};

export default ViewPage;
