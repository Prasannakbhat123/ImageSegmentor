import React, { useState, useRef, useEffect } from "react";

const Preview = ({ 
  selectedFile, 
  currentTool,
  onProcessPolygons 
}) => {
  const [polygons, setPolygons] = useState({});
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previousFileRef = useRef(null); // Reference to store the previous file

  useEffect(() => {
    if (selectedFile) {
      // Log the points of the previously selected image
      if (previousFileRef.current) {
        console.log(`Previous Image: ${previousFileRef.current}`, polygons[previousFileRef.current] || []);
      }

      // Update the previous file reference to the current one
      previousFileRef.current = selectedFile;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      img.onload = () => {
        // Set canvas size to match parent div
        const parentDiv = canvas.parentElement;
        const parentStyle = window.getComputedStyle(parentDiv);
        const maxWidth = parseInt(parentStyle.width) - 40; // Account for padding
        const maxHeight = parseInt(parentStyle.height) - 80; // Account for padding and button

        // Calculate aspect ratio scaling
        const scale = Math.min(
          maxWidth / img.width,
          maxHeight / img.height
        );

        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;

        // Reset current polygon and redraw canvas
        setCurrentPolygon([]);
        redrawCanvas(selectedFile);
      };
    }
  }, [selectedFile]);

  const redrawCanvas = (file) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
  
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw scaled image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;
  
    // Draw existing polygons for the current image
    const currentPolygons = polygons[file] || [];
    currentPolygons.forEach((polygon) => {
      ctx.beginPath();
      
      const scaledPoints = polygon.points.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY
      }));
      
      ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
      ctx.lineWidth = 2;
  
      scaledPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
  
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
  
      // Draw points
      scaledPoints.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  
    // Draw current polygon in progress
    if (currentPolygon.length > 0) {
      ctx.beginPath();
      const scaledCurrentPolygon = currentPolygon.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY
      }));
  
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.lineWidth = 2;
  
      scaledCurrentPolygon.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
  
      // Draw points immediately
      scaledCurrentPolygon.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
  
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;
  
    const x = (e.clientX - rect.left) / scaleX;
    const y = (e.clientY - rect.top) / scaleY;
  
    if (currentTool === 'marker') {
      const closeThreshold = 20;
  
      // Update the current polygon state
      setCurrentPolygon(prev => {
        const newPolygon = [...prev, { x, y }];
  
        // Check for polygon closure
        if (newPolygon.length > 2 &&
            Math.abs(x - newPolygon[0].x) < closeThreshold &&
            Math.abs(y - newPolygon[0].y) < closeThreshold) {
          const finalPolygon = newPolygon.slice(0, -1); // Remove the last point
          const name = prompt('Name this polygon:') || `Polygon ${Object.keys(polygons).length + 1}`;
          setPolygons(prevPolygons => ({
            ...prevPolygons,
            [selectedFile]: [...(prevPolygons[selectedFile] || []), { 
              name, 
              points: finalPolygon 
            }]
          }));
          return []; // Clear current polygon
        }
  
        return newPolygon; // Update current polygon
      });
  
    } else if (currentTool === 'selector') {
      // Selector tool logic remains the same
      const tolerance = 10 * (img.width / canvas.width);
      const currentPolygons = polygons[selectedFile] || [];
      for (let polyIndex = 0; polyIndex < currentPolygons.length; polyIndex++) {
        for (let pointIndex = 0; pointIndex < currentPolygons[polyIndex].points.length; pointIndex++) {
          const point = currentPolygons[polyIndex].points[pointIndex];
          if (
            Math.abs(x - point.x) < tolerance && 
            Math.abs(y - point.y) < tolerance
          ) {
            setSelectedPointIndex({ polyIndex, pointIndex });
            return;
          }
        }
      }
    } else if (currentTool === 'eraser') {
      // Eraser tool logic remains the same
      const tolerance = 15 * (img.width / canvas.width);
      const updatedPolygons = (polygons[selectedFile] || []).map(polygon => ({
        ...polygon,
        points: polygon.points.filter(point => 
          Math.abs(x - point.x) > tolerance || 
          Math.abs(y - point.y) > tolerance
        )
      })).filter(polygon => polygon.points.length > 2);
  
      setPolygons(prevPolygons => ({
        ...prevPolygons,
        [selectedFile]: updatedPolygons
      }));
    }
  };

  useEffect(() => {
    if (selectedFile) {
      redrawCanvas(selectedFile);
    }
  }, [currentPolygon, polygons, selectedFile]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.width / canvas.width);
    const y = (e.clientY - rect.top) * (img.height / canvas.height);

    if (currentTool === 'selector' && selectedPointIndex !== null) {
      const newPolygons = [...(polygons[selectedFile] || [])];
      newPolygons[selectedPointIndex.polyIndex].points[selectedPointIndex.pointIndex] = { x, y };
      setPolygons(prevPolygons => ({
        ...prevPolygons,
        [selectedFile]: newPolygons
      }));
      redrawCanvas(selectedFile);
    }
  };

  const handleMouseUp = () => {
    setSelectedPointIndex(null);
  };

  const processPolygons = () => {
    const processedPolygons = (polygons[selectedFile] || []).map(polygon => ({
      name: polygon.name,
      points: polygon.points.map(point => [point.x, point.y])
    }));
    onProcessPolygons(processedPolygons);
  };

  return (
    <div className="w-10/12 flex flex-col justify-center items-center bg-[#fff] p-6 shadow-xl">
      {selectedFile ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img 
            ref={imageRef}
            src={selectedFile}
            alt="Preview"
            className="hidden"
            onLoad={redrawCanvas}
          />
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="max-w-full max-h-full border-4 border-gray-400 rounded-lg shadow-md"
          />
          <button 
            onClick={processPolygons}
            className="mt-4 bg-[#2E3192] rounded-full text-white px-8 py-2 hover:bg-[#1a1c4a] transition"
          >
            Process
          </button>
        </div>
      ) : (
        <p className="text-[#2E3192] text-lg font-semibold">Select a file to preview</p>
      )}
    </div>
  );
};

export default Preview;