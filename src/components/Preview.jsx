import React, { useState, useRef, useEffect } from "react";
import PolygonList from "./PolygonList"; // Import PolygonList

const Preview = ({ selectedFile, currentTool, onProcessPolygons, onUpdatePolygons, selectedPolygon }) => {
  const [polygons, setPolygons] = useState({});
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previousFileRef = useRef(null);

  useEffect(() => {
    if (selectedFile) {
      if (previousFileRef.current) {
        console.log(`Previous Image: ${previousFileRef.current}`, polygons[previousFileRef.current] || []);
      }
      previousFileRef.current = selectedFile;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      img.onload = () => {
        const parentDiv = canvas.parentElement;
        const parentStyle = window.getComputedStyle(parentDiv);
        const maxWidth = parseInt(parentStyle.width) - 40;
        const maxHeight = parseInt(parentStyle.height) - 80;

        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;

        setCurrentPolygon([]);
        redrawCanvas(selectedFile);
      };
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedPolygon) {
      redrawSelectedPolygon(selectedPolygon);
    }
  }, [selectedPolygon]);

  const redrawCanvas = (file) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

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

      scaledPoints.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw label and group
      if (polygon.name) {
        const firstPoint = scaledPoints[0];
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        const textWidth = ctx.measureText(`${polygon.name} (${polygon.group})`).width;
        const padding = 4;
        const rectWidth = textWidth + padding * 2;
        const rectHeight = 20;

        ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
        ctx.fillRect(firstPoint.x, firstPoint.y - rectHeight - 5, rectWidth, rectHeight);

        ctx.fillStyle = 'white';
        ctx.fillText(`${polygon.name} (${polygon.group})`, firstPoint.x + padding, firstPoint.y - 10);
      }
    });

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

      scaledCurrentPolygon.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.stroke();
    }
  };

  const redrawSelectedPolygon = (polygon) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

    const scaledPoints = polygon.points.map(point => ({
      x: point.x * scaleX,
      y: point.y * scaleY
    }));

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 2;

    scaledPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
    ctx.fill();
    ctx.stroke();

    scaledPoints.forEach((point) => {
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw label and group
    if (polygon.name) {
      const firstPoint = scaledPoints[0];
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      const textWidth = ctx.measureText(`${polygon.name} (${polygon.group})`).width;
      const padding = 4;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = 20;

      ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
      ctx.fillRect(firstPoint.x, firstPoint.y - rectHeight - 5, rectWidth, rectHeight);

      ctx.fillStyle = 'white';
      ctx.fillText(`${polygon.name} (${polygon.group})`, firstPoint.x + padding, firstPoint.y - 10);
    }
  };

  const reorderPoints = (points) => {
    if (points.length <= 2) return points;

    const remainingPoints = [...points];
    const orderedPoints = [remainingPoints.shift()];

    while (remainingPoints.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < remainingPoints.length; i++) {
        const dx = orderedPoints[orderedPoints.length - 1].x - remainingPoints[i].x;
        const dy = orderedPoints[orderedPoints.length - 1].y - remainingPoints[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      orderedPoints.push(remainingPoints.splice(nearestIndex, 1)[0]);
    }

    return orderedPoints;
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

      setCurrentPolygon(prev => {
        const newPolygon = [...prev, { x, y }];

        if (newPolygon.length > 2 &&
          Math.abs(x - newPolygon[0].x) < closeThreshold &&
          Math.abs(y - newPolygon[0].y) < closeThreshold) {
          const finalPolygon = newPolygon.slice(0, -1);
          const name = prompt('Name this polygon:') || `Polygon ${Object.keys(polygons).length + 1}`;
          const group = prompt('Enter group number:') || '1';
          const updatedPolygons = {
            ...polygons,
            [selectedFile]: [...(polygons[selectedFile] || []), {
              name,
              group,
              points: reorderPoints(finalPolygon)
            }]
          };
          setPolygons(updatedPolygons);
          onUpdatePolygons(updatedPolygons); // Update parent component with all polygons
          return [];
        }

        return newPolygon;
      });
    } else if (currentTool === 'selector') {
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
      const tolerance = 15 * (img.width / canvas.width);
      const updatedPolygons = (polygons[selectedFile] || []).map(polygon => ({
        ...polygon,
        points: polygon.points.filter(point =>
          Math.abs(x - point.x) > tolerance ||
          Math.abs(y - point.y) > tolerance
        )
      })).filter(polygon => polygon.points.length > 2);

      const newPolygons = {
        ...polygons,
        [selectedFile]: updatedPolygons
      };

      setPolygons(newPolygons);
      onUpdatePolygons(newPolygons); // Update parent component with all polygons
    } else if (currentTool === 'edit') {
      const tolerance = 20;
      const currentPolygons = polygons[selectedFile] || [];
      let updated = false;

      for (let polyIndex = 0; polyIndex < currentPolygons.length; polyIndex++) {
        const polygon = currentPolygons[polyIndex];
        let nearestPointIndex = -1;
        let nearestDistance = Infinity;

        for (let pointIndex = 0; pointIndex < polygon.points.length; pointIndex++) {
          const point = polygon.points[pointIndex];
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = pointIndex;
          }
        }

        if (nearestPointIndex !== -1 && nearestDistance <= tolerance) {
          const newPoints = [...polygon.points];
          newPoints.splice(nearestPointIndex + 1, 0, { x, y });

          const reorderedPoints = reorderPoints(newPoints);

          const updatedPolygons = [...currentPolygons];
          updatedPolygons[polyIndex] = { ...polygon, points: reorderedPoints };

          const newPolygons = {
            ...polygons,
            [selectedFile]: updatedPolygons
          };

          setPolygons(newPolygons);
          onUpdatePolygons(newPolygons); // Update parent component with all polygons
          updated = true;
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (selectedFile) {
      redrawCanvas(selectedFile);
      if (selectedPolygon) {
        redrawSelectedPolygon(selectedPolygon);
      }
    }
  }, [currentPolygon, polygons, selectedFile, selectedPolygon]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.width / canvas.width);
    const y = (e.clientY - rect.top) * (img.height / canvas.height);

    if (currentTool === 'selector' && selectedPointIndex !== null) {
      const newPolygons = [...(polygons[selectedFile] || [])];
      newPolygons[selectedPointIndex.polyIndex].points[selectedPointIndex.pointIndex] = { x, y };
      const updatedPolygons = {
        ...polygons,
        [selectedFile]: newPolygons
      };
      setPolygons(updatedPolygons);
      redrawCanvas(selectedFile);
      onUpdatePolygons(updatedPolygons); // Update parent component with all polygons
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

  const joinPolygon = () => {
    if (currentPolygon.length < 3) return;

    const name = prompt('Name this polygon:') || `Polygon ${Object.keys(polygons).length + 1}`;
    const group = prompt('Enter group number:') || '1';
    const reorderedPoints = reorderPoints(currentPolygon);

    const updatedPolygons = {
      ...polygons,
      [selectedFile]: [...(polygons[selectedFile] || []), {
        name,
        group,
        points: reorderedPoints
      }]
    };

    setPolygons(updatedPolygons);
    setCurrentPolygon([]);
    redrawCanvas(selectedFile);
    onUpdatePolygons(updatedPolygons); // Update parent component with all polygons
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
          <div className="mt-4 flex space-x-4">
            <button
              onClick={processPolygons}
              className="bg-[#2E3192] rounded-full text-white px-8 py-2 hover:bg-[#1a1c4a] transition"
            >
              Process
            </button>
            <button
              onClick={joinPolygon}
              className="bg-[#2E3192] rounded-full text-white px-8 py-2 hover:bg-[#1a1c4a] transition"
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[#2E3192] text-lg font-semibold">Select a file to preview</p>
      )}
    </div>
  );
};

export default Preview;
