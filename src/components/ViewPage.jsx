import React, { useState } from "react";
import Tools from "./Tools";
import FolderTree from "./FolderTree";
import Preview from "./Preview";
import logo from '../assets/IGlogo.png'

const ViewPage = ({ uploadedFiles, setViewMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTool, setCurrentTool] = useState('marker');

  const handleProcessPolygons = (processedPolygons) => {
    console.log('Processed Polygons:', processedPolygons);
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
          onFileSelect={(fileUrl) => setSelectedFile(fileUrl)}
        />
        <Preview 
          selectedFile={selectedFile} 
          currentTool={currentTool}
          onProcessPolygons={handleProcessPolygons}
        />
      </div>
    </div>
  );
};

export default ViewPage;