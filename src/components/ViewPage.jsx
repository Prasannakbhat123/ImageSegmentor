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
  const [fileNames, setFileNames] = useState({});
  const [allPolygons, setAllPolygons] = useState([]);

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

    // Set the file name for the selected file
    if (filePath) {
      const fileName = filePath.split('/').pop();
      console.log(`Setting file name for ${fileUrl}: ${fileName}`);
      setFileNames(prev => ({
        ...prev,
        [fileUrl]: fileName // Extract the file name from the file path
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
  
    setPolygons(prevPolygons => {
      const currentPolygons = prevPolygons[selectedFile?.url] || [];
      const updatedPolygons = [...currentPolygons];
      
      const existingIndex = updatedPolygons.findIndex(p => p.name === polygon.name);
      if (existingIndex === -1) {
        updatedPolygons.push({ ...polygon, fileUrl: selectedFile?.url });
      } else {
        updatedPolygons[existingIndex] = { ...polygon, fileUrl: selectedFile?.url };
      }
  
      return {
        ...prevPolygons,
        [selectedFile?.url]: updatedPolygons
      };
    });
  
    setAllPolygons(prev => {
      const existingIndex = prev.findIndex(p => p.name === polygon.name && p.fileUrl === selectedFile?.url);
      if (existingIndex === -1) {
        return [...prev, { ...polygon, fileUrl: selectedFile?.url }];
      } else {
        return prev.map((p, index) => 
          index === existingIndex ? { ...polygon, fileUrl: selectedFile?.url } : p
        );
      }
    });
  
    setSelectedPolygons(prevSelectedPolygons => {
      const existingIndex = prevSelectedPolygons.findIndex(p => p.name === polygon.name && p.fileUrl === selectedFile?.url);
      if (existingIndex === -1) {
        return [...prevSelectedPolygons, { ...polygon, fileUrl: selectedFile?.url }];
      } else {
        return prevSelectedPolygons.map((p, index) => 
          index === existingIndex ? { ...polygon, fileUrl: selectedFile?.url } : p
        );
      }
    });
  
    setSelectedPolygon(polygon);
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

  useEffect(() => {
    const newAllPolygons = Object.entries(polygons).flatMap(([fileUrl, filePolygons]) =>
      filePolygons.map(polygon => ({ ...polygon, fileUrl }))
    );
    setAllPolygons(newAllPolygons);
  }, [polygons]);

  console.log("File Names:", fileNames);

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
  polygons={allPolygons} 
  onPolygonClick={handlePolygonClick}
  fileNames={fileNames}
  selectedFile={selectedFile?.url}
  selectedPolygon={selectedPolygon} // Pass the selectedPolygon prop
/>
      </div>
    </div>
  );
};

export default ViewPage;