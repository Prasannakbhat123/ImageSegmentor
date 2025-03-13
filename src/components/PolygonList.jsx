import React from "react";

const PolygonList = ({ polygons, onPolygonClick }) => {
  return (
    <div className="w-1/4 bg-gray-100 p-4 h-full overflow-y-auto shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-black">Polygons</h2>
      {polygons.length > 0 ? (
        polygons.map((polygon, index) => (
          <div 
            key={index} 
            className="mb-4 p-2 bg-white shadow-md rounded-md cursor-pointer"
            onClick={() => onPolygonClick(polygon)} // Handle click event
          >
            <h3 className="text-lg font-semibold text-gray-900">{polygon.name}</h3>
            <p className="text-sm text-gray-600">Group: {polygon.group}</p>
            <p className="text-sm text-gray-600">Points: {polygon.points.length}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No polygons created yet.</p>
      )}
    </div>
  );
};

export default PolygonList;
