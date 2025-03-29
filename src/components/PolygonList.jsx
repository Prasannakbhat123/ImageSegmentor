import React, { useState, useEffect } from 'react';

const PolygonList = ({ polygons, onPolygonClick, fileNames, selectedFile, selectedPolygon }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    // Automatically open the dropdown for the selected file and close others
    setExpandedGroups({
      [selectedFile]: true
    });
  }, [selectedFile]);

  const toggleGroup = (fileUrl) => {
    setExpandedGroups(prev => ({
      ...prev,
      [fileUrl]: !prev[fileUrl]
    }));
  };

  const groupedPolygons = polygons.reduce((acc, polygon) => {
    if (!acc[polygon.fileUrl]) {
      acc[polygon.fileUrl] = [];
    }
    acc[polygon.fileUrl].push(polygon);
    return acc;
  }, {});

  return (
    <div className="w-1/4 max-h-[90vh] bg-gray-100 p-4 h-full overflow-y-auto shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-black">Polygons</h2>
      {Object.keys(groupedPolygons).length > 0 ? (
        Object.keys(groupedPolygons).map((fileUrl) => (
          <div key={fileUrl} className="mb-4">
            <div 
              className={`p-2 ${fileUrl === selectedFile ? 'bg-blue-200' : 'bg-gray-200'} shadow-md rounded-md cursor-pointer`}
              onClick={() => toggleGroup(fileUrl)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {fileNames[fileUrl] || 'Unnamed File'} 
                <span className="text-sm ml-2 text-gray-600">({groupedPolygons[fileUrl].length} polygons)</span>
              </h3>
            </div>
            {expandedGroups[fileUrl] && (
              <div className="mt-2">
                {groupedPolygons[fileUrl].map((polygon, index) => (
                  <div 
                    key={`${polygon.name}-${index}`} 
                    className={`mb-2 p-2 shadow-md rounded-md cursor-pointer ${selectedPolygon?.name === polygon.name && selectedPolygon?.fileUrl === polygon.fileUrl ? 'bg-blue-100' : 'bg-white'}`}
                    onClick={() => onPolygonClick(polygon)}
                  >
                    <h4 className="text-md font-semibold text-gray-900">{polygon.name}</h4>
                    <p className="text-sm text-gray-600">Group: {polygon.group}</p>
                    <p className="text-sm text-gray-600">Points: {polygon.points.length}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600">No polygons created yet.</p>
      )}
    </div>
  );
};

export default PolygonList;