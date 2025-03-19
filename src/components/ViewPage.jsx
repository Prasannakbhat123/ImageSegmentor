import { useState } from "react";
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
    const updatedPolygon = { ...polygon, fileUrl: selectedFile?.url };
    const existingPolygons = [...selectedPolygons];
    const index = existingPolygons.findIndex(p => p.name === updatedPolygon.name && p.fileUrl === updatedPolygon.fileUrl);
  
    if (index !== -1) {
      existingPolygons.splice(index, 1);
    } else {
      existingPolygons.push(updatedPolygon);
    }
  
    setSelectedPolygons(existingPolygons);
  };
  

  
  const handlePolygonSelection = (polygon) => {
    if (!selectedFile) return;
  
    const newPolygons = {
      ...polygons,
      [selectedFile.url]: [...(polygons[selectedFile.url] || []), polygon]
    };
  
    setPolygons(newPolygons);
    handleUpdatePolygons(newPolygons);
  };

  // Get all polygons as a flat array for the polygon list
  const getAllPolygons = () => {
    return Object.entries(polygons).flatMap(([fileUrl, filePolygons]) => 
      filePolygons.map(polygon => ({
        ...polygon,
        fileUrl
      }))
    );
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
          onPolygonSelection={handlePolygonSelection}
          selectedPolygons={selectedPolygons} // Ensure this prop is passed
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