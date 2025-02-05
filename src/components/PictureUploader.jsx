import React, { useState } from "react";

const PictureUploader = ({ setUploadedFiles, setViewMode }) => {
  const [files, setFiles] = useState({});
  const [currentFolder, setCurrentFolder] = useState(files);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map((file) => ({
      name: file.name,
      type: "file",
      file,
      url: URL.createObjectURL(file),
    }));

    setFiles((prev) => {
      const updatedFiles = {
        ...prev,
        ...Object.fromEntries(newFiles.map((f) => [f.name, f])),
      };
      setCurrentFolder(updatedFiles);
      return updatedFiles;
    });
  };

  const handleFolderUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const folderStructure = { ...files };

    uploadedFiles.forEach((file) => {
      const path = file.webkitRelativePath.split("/");
      let current = folderStructure;

      for (let i = 0; i < path.length; i++) {
        if (i === path.length - 1) {
          current[path[i]] = {
            name: path[i],
            type: "file",
            file,
            url: URL.createObjectURL(file),
          };
        } else {
          if (!current[path[i]]) {
            current[path[i]] = { name: path[i], type: "folder", contents: {} };
          }
          current = current[path[i]].contents;
        }
      }
    });

    setFiles(folderStructure);
    setCurrentFolder(folderStructure);
  };

  const removeItem = (itemName, isFolder) => {
    const removeItemRecursive = (obj) => {
      const updatedObj = { ...obj };
      
      Object.keys(updatedObj).forEach(key => {
        if (key === itemName) {
          delete updatedObj[key];
        } else if (updatedObj[key].type === 'folder') {
          updatedObj[key].contents = removeItemRecursive(updatedObj[key].contents);
        }
      });
      
      return updatedObj;
    };

    setFiles(prevFiles => removeItemRecursive(prevFiles));
    setCurrentFolder(prevFolder => removeItemRecursive(prevFolder));

    const revokeUrls = (obj) => {
      Object.values(obj).forEach(item => {
        if (item.type === 'file' && item.url) {
          URL.revokeObjectURL(item.url);
        }
        if (item.type === 'folder' && item.contents) {
          revokeUrls(item.contents);
        }
      });
    };
    revokeUrls({ [itemName]: files[itemName] });

    if (breadcrumbs.includes(itemName)) {
      setCurrentFolder(files);
      setBreadcrumbs([]);
    }
  };

  const navigateToParentFolder = () => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      
      let parentFolder = files;
      for (const folder of newBreadcrumbs) {
        parentFolder = parentFolder[folder].contents;
      }
      
      setCurrentFolder(parentFolder);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  const handleDoneUploading = () => {
    setUploadedFiles(files);
    setViewMode(true);
  };

  const renderThumbnails = (items) => {
    return Object.values(items).map((item, index) => (
      <div
        key={index}
        className="w-32 h-32 m-2 relative flex flex-col items-center border-2 border-blue-400 rounded-lg p-2 cursor-pointer"
        onClick={() => {
          if (item.type === "folder") {
            setCurrentFolder(item.contents);
            setBreadcrumbs((prev) => [...prev, item.name]);
          }
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeItem(item.name, item.type === "folder");
          }}
          className="absolute top-1 right-1 z-10 bg-transparent border-none cursor-pointer"
        >
          ❌
        </button>

        {item.type === "file" ? (
          <img 
            src={item.url} 
            alt={item.name} 
            className="w-20 h-20 object-cover rounded-md" 
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-blue-200 rounded-md">
            📁
          </div>
        )}
        <p className="text-sm font-medium text-blue-700 truncate w-full text-center mt-1">
          {item.name}
        </p>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-[#f2f2f2] rounded-lg shadow-lg w-[55vw] mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-7">
        Image & Folder Uploader
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <label className="bg-[#2E3192] text-white px-5 py-3 rounded-full cursor-pointer hover:bg-[#262980] transition text-md font-semibold">
          Upload Images
          <input 
            type="file" 
            multiple 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>

        <label className="border-2 border-[#2E3192] text-[#2E3192] px-5 py-3 rounded-full cursor-pointer hover:bg-[#e6e6e6] transition text-md font-semibold">
          Upload Folders
          <input 
            type="file" 
            directory="true"
            webkitdirectory="true"
            multiple 
            onChange={handleFolderUpload} 
            className="hidden" 
          />
        </label>
      </div>

      {breadcrumbs.length > 0 && (
        <div className="mb-4">
          <button
            className="text-blue-700 underline font-semibold"
            onClick={navigateToParentFolder}
          >
            ⬅ Back to Parent
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center">
        {renderThumbnails(currentFolder)}
      </div>

      {Object.keys(files).length > 0 && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={handleDoneUploading}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default PictureUploader;