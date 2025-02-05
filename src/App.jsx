import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import PictureUploader from "./components/PictureUploader";
import Footer from "./components/Footer";
import Faq from "./components/Faq";
import ViewPage from "./components/ViewPage";
import homebg from './assets/homebg.jpg';

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [viewMode, setViewMode] = useState(false);

  return (
    <div className="w-screen min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${homebg})` }}>
      <div className="w-screen min-h-screen overflow-auto">
        {!viewMode ? (
          <>
            <Navbar />
            {/* <HomeSection /> */}
            <section
  id="try"
  className="w-screen h-[100vh] flex items-center justify-center flex-col space-y-8"
>
  <div className="text-center">
    <h2 className="text-5xl font-bold text-black">Welcome to the Image Segmenter Tool!</h2>
    <p className="text-lg text-gray-600 mt-2 w-[500px] text-center mx-auto mb-10">Easily upload and manage your images here and get the segmentation of that image</p>
  </div>
  <div className="mt-8">
    <PictureUploader 
      setUploadedFiles={setUploadedFiles} 
      setViewMode={setViewMode} 
    />
  </div>
</section>

            <section
              id="faq"
              className="w-screen h-screen flex items-center justify-center bg-blue-400 bg-opacity-50"
            >
              <div className="w-full max-w-5xl h-full flex items-center justify-center">
                <Faq />
              </div>
            </section>
            <Footer />
          </>
        ) : (
          <ViewPage 
            uploadedFiles={uploadedFiles} 
            setViewMode={setViewMode} 
          />
        )}
      </div>
    </div>
  );
};

export default App;