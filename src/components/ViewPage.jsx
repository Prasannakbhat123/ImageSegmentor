import React, { useState, useEffect } from "react";
import Tools from "./Tools";
import FolderTree from "./FolderTree";
import Preview from "./Preview";
import PolygonList from "./PolygonList";
import logo from '../assets/IGlogo.png';
import JsonStorageService from "../services/JsonStorageService";

const ViewPage = ({ uploadedFiles, setViewMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTool, setCurrentTool] = useState('marker');
  const [polygons, setPolygons] = useState({});
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [selectedPolygons, setSelectedPolygons] = useState([]);
  const [fileNames, setFileNames] = useState({});
  const [allPolygons, setAllPolygons] = useState([]);
  const [jsonDataPreview, setJsonDataPreview] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

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

  // Keep only one useEffect for auto-saving to avoid duplicates
  useEffect(() => {
    if (selectedFile?.url && fileNames[selectedFile.url]) {
      const imagePolygons = polygons[selectedFile.url] || [];
      const fileName = fileNames[selectedFile.url];
      
      if (imagePolygons.length > 0) {
        // Auto-save to JSON file named after the image
        const savedData = JsonStorageService.savePolygonData(fileName, selectedFile.url, imagePolygons);
        console.log(`Auto-saved polygon data for ${fileName} with ${imagePolygons.length} polygons`);
      }
    }
  }, [polygons, selectedFile, fileNames]);

  const viewJsonData = () => {
    if (!selectedFile?.url) {
      alert("Please select a file first");
      return;
    }
    
    const fileName = fileNames[selectedFile.url] || 'unnamed-file';
    const imagePolygons = polygons[selectedFile.url] || [];
    
    if (imagePolygons.length === 0) {
      alert("No polygons to view for this image.");
      return;
    }
    
    // Get the JSON data that was already saved automatically
    const baseFileName = fileName.split('.')[0];
    const savedData = JsonStorageService.getPolygonData(fileName);
    
    if (!savedData) {
      alert("No saved data found for this image.");
      return;
    }
    
    // Show JSON data in modal
    setJsonDataPreview({
      ...savedData,
      jsonFileName: `${baseFileName}.json`, 
      path: `${JsonStorageService.jsonFolderPath}${baseFileName}.json`
    });
    setShowJsonModal(true);
  };

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
          onExportPolygons={viewJsonData}
        />
<PolygonList 
  polygons={allPolygons} 
  onPolygonClick={handlePolygonClick}
  fileNames={fileNames}
  selectedFile={selectedFile?.url}
  selectedPolygon={selectedPolygon} // Pass the selectedPolygon prop
/>
      </div>
      {/* JSON Data Preview Modal - Updated to reflect that data is already saved */}
      {showJsonModal && jsonDataPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 h-3/4 overflow-auto">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-green-600 mr-2">✓</span>
              JSON File: <span className="text-blue-600">{jsonDataPreview.jsonFileName}</span>
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Path: {jsonDataPreview.path}
            </p>
            <p className="text-sm text-green-600 mb-4 italic">
              This file is automatically updated whenever polygons are created or modified.
            </p>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold">Text Format:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                {JsonStorageService.convertToText(jsonDataPreview)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold">JSON Format:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(jsonDataPreview, null, 2)}
              </pre>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={closeJsonModal}
                className="px-4 py-2 bg-[#2E3192] text-white rounded-md hover:bg-[#1a1c4a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPage;