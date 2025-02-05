import React, { useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from "lucide-react";

const FolderTree = ({ files, onFileSelect }) => {
  const [openFolders, setOpenFolders] = useState({});

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const renderTree = (items, level = 0) => {
    return Object.keys(items).map((key) => {
      const item = items[key];

      return (
        <div key={key} className="">
          {item.type === "folder" ? (
            <div
              className="flex items-center space-x-2 text-lg text-[#2E3192] font-semibold mt-2 cursor-pointer hover:text-[#1b1c45] transition"
              onClick={() => toggleFolder(item.name)}
            >
              {openFolders[item.name] ? (
                <ChevronDown className="w-4 h-4 text-[#2E3192]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#2E3192]" />
              )}
              {openFolders[item.name] ? (
                <FolderOpen className="w-5 h-5 text-[#2E3192] font-bold" />
              ) : (
                <Folder className="w-5 h-5 text-[#2E3192] font-bold" />
              )}
              <span>{item.name}</span>
            </div>
          ) : (
            <div
              className={`flex items-center space-x-2 cursor-pointer mt-1 p-2 transition ${
                openFolders[item.name] ? "bg-gray-300-500 text-white font-bold" : "text-[#787bff] hover:bg-gray-200 hover:text-[#2E3192] rounded-md"
              }`}
              onClick={() => onFileSelect(item.url)}
              style={{ paddingLeft: `${level * 8}px` }} // Indentation for nested files
            >
              <FileText className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
          )}
          {item.type === "folder" && openFolders[item.name] && (
            <div className="ml-6">{renderTree(item.contents, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-1/4 bg-[#f0f0f0] text-black p-5 h-full overflow-y-auto shadow-lg border-r-2 border-[#d8d8d8]">
      <h2 className="text-2xl font-bold mb-10 text-center flex items-center justify-center">
        <Folder className="w-6 h-6 mr-2" /> Folder Tree
      </h2>
      {renderTree(files)}
    </div>
  );
};

export default FolderTree;
