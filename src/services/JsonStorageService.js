/**
 * Service to handle JSON storage for polygon data
 * Saves actual JSON files to the json folder in src
 */
class JsonStorageService {
  constructor() {
    this.jsonStorage = {};
    this.jsonFolderPath = 'src/json/';
    
    // Attempt to load from localStorage for persistence between sessions
    try {
      const savedData = localStorage.getItem('polygonJsonData');
      if (savedData) {
        this.jsonStorage = JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading polygon data from storage:', error);
    }
    
    // Check if running in Node.js environment (Electron or SSR)
    this.isNode = typeof window === 'undefined' || 
      (typeof process !== 'undefined' && process.versions && process.versions.node);
    
    // Import fs dynamically if in Node environment
    if (this.isNode) {
      try {
        this.fs = require('fs');
        this.path = require('path');
      } catch (e) {
        console.warn('File system modules not available');
      }
    }
  }
  
  /**
   * Save polygon data for a specific image
   * Actually creates or updates a JSON file in the src/json folder
   */
  savePolygonData(fileName, fileUrl, polygons) {
    if (!fileName || !fileUrl || !polygons) return null;
    
    // Remove file extension for cleaner filenames
    const baseFileName = fileName.split('.')[0];
    const jsonFileName = `${baseFileName}.json`;
    const fullPath = `${this.jsonFolderPath}${jsonFileName}`;
    
    // Format the data according to the specified structure
    const formattedData = this.formatPolygonData(fileName, polygons);
    
    // Store the data with the base filename
    this.jsonStorage[baseFileName] = {
      fileUrl,
      data: formattedData,
      lastUpdated: new Date().toISOString(),
      jsonFilePath: fullPath,
      jsonFileName: jsonFileName
    };
    
    // Save to localStorage for persistence
    this._saveToLocalStorage();
    
    // Actually write the file using the appropriate method
    this._writeJsonToFile(fullPath, formattedData);
    
    return {
      ...formattedData,
      jsonFilePath: fullPath,
      jsonFileName: jsonFileName
    };
  }
  
  /**
   * Get polygon data for a specific file
   * @param {string} fileName - Name of the image file
   * @returns {Object|null} - Polygon data for the specified file or null
   */
  getPolygonData(fileName) {
    if (!fileName) return null;
    
    // Remove file extension if present
    const baseFileName = fileName.split('.')[0];
    return this.jsonStorage[baseFileName]?.data || null;
  }
  
  /**
   * Get all stored polygon data
   * @returns {Object} - All stored polygon data
   */
  getAllPolygonData() {
    return this.jsonStorage;
  }
  
  /**
   * Format polygon data according to the specified structure
   * @param {string} fileName - Name of the image file
   * @param {Array} polygons - Array of polygon objects
   * @returns {Object} - Formatted polygon data
   */
  formatPolygonData(fileName, polygons) {
    // Group polygons by their class/group name
    const groupedByClass = {};
    
    polygons.forEach(polygon => {
      if (!groupedByClass[polygon.group]) {
        groupedByClass[polygon.group] = {};
      }
      
      if (!groupedByClass[polygon.group][polygon.name]) {
        groupedByClass[polygon.group][polygon.name] = [];
      }
      
      groupedByClass[polygon.group][polygon.name].push(polygon.points);
    });
    
    // Format the data according to the specified structure
    const formattedData = {
      imageName: fileName,
      classes: Object.keys(groupedByClass).map(className => ({
        className,
        instances: Object.keys(groupedByClass[className]).flatMap(instanceName =>
          groupedByClass[className][instanceName].map((points, index) => ({
            instanceId: `${instanceName}-${index + 1}`,
            name: instanceName,
            coordinates: points.map(point => [Math.round(point.x), Math.round(point.y)])
          }))
        )
      }))
    };
    
    return formattedData;
  }
  
  /**
   * Convert polygon data to a text representation
   * @param {Object} data - Formatted polygon data
   * @returns {string} - Text representation of polygon data
   */
  convertToText(data) {
    if (!data) return '';
    
    let output = `Image name: ${data.imageName}\n\n`;
    
    data.classes.forEach(classInfo => {
      output += `Class name: ${classInfo.className}\n`;
      
      classInfo.instances.forEach(instance => {
        output += `- instance ${instance.instanceId.split('-')[1]} (${instance.name})\n`;
        output += "      Point coordinates:\n";
        
        instance.coordinates.forEach(point => {
          output += `      [${point[0]}, ${point[1]}]\n`;
        });
        
        output += "\n";
      });
      
      output += "\n";
    });
    
    return output;
  }
  
  /**
   * Actually writes JSON data to a file
   * Uses different methods depending on environment
   */
  _writeJsonToFile(filePath, content) {
    const jsonString = JSON.stringify(content, null, 2);
    
    // First try to use fetch with PUT or POST if in browser
    if (!this.isNode) {
      // Attempt to use a serverless function or API endpoint
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        const jsonBlob = new Blob([jsonString], { type: 'application/json' });
        formData.append('file', jsonBlob, filePath.split('/').pop());
        formData.append('path', filePath);
        
        // Send to backend API - assuming there's a file upload endpoint
        fetch('/api/save-json', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (response.ok) {
            console.log(`✅ Successfully saved ${filePath} to JSON folder`);
            
            // Also provide a download link as fallback
            this._offerDownload(filePath.split('/').pop(), jsonString);
          } else {
            console.error(`Failed to save file ${filePath}`);
            
            // Fallback to download method
            this._offerDownload(filePath.split('/').pop(), jsonString);
          }
        })
        .catch(err => {
          console.error('Error saving file:', err);
          
          // Fallback to download method
          this._offerDownload(filePath.split('/').pop(), jsonString);
        });
      } catch (err) {
        console.warn('API save failed, using download fallback:', err);
        this._offerDownload(filePath.split('/').pop(), jsonString);
      }
    } else if (this.fs) {
      // If in Node.js environment (Electron app), use the fs module
      try {
        // Ensure the json directory exists
        const dirPath = this.path.dirname(filePath);
        if (!this.fs.existsSync(dirPath)) {
          this.fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Write the file
        this.fs.writeFileSync(filePath, jsonString);
        console.log(`✅ Successfully saved ${filePath} to JSON folder`);
        return true;
      } catch (err) {
        console.error('Error writing file:', err);
        return false;
      }
    }
  }
  
  /**
   * Offers a file download in browser environments as fallback
   */
  _offerDownload(filename, content) {
    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'application/json' });
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    
    // Add a notification message
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#2E3192';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span>📁 JSON saved to <b>${filename}</b></span>
        <button id="download-btn" style="padding:5px 10px;background:white;color:#2E3192;border:none;border-radius:3px;cursor:pointer;">
          Save Local Copy
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listener to the download button
    document.getElementById('download-btn').addEventListener('click', function() {
      element.click();
      URL.revokeObjectURL(element.href);
    });
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
    
    console.log(`✅ JSON saved for ${filename}. Download offered as fallback.`);
  }
  
  /**
   * Save data to localStorage
   * @private
   */
  _saveToLocalStorage() {
    try {
      localStorage.setItem('polygonJsonData', JSON.stringify(this.jsonStorage));
    } catch (error) {
      console.error('Error saving polygon data to storage:', error);
    }
  }
}

export default new JsonStorageService();
