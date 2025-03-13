import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import PictureUploader from "./components/PictureUploader";
import Footer from "./components/Footer";
import Faq from "./components/Faq";
import ViewPage from "./components/ViewPage";
import homebg from "./assets/homebg.jpg";

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [viewMode, setViewMode] = useState(false);

  return (
    <div
      className="w-screen min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${homebg})` }}
    >
      <div className="w-screen min-h-screen overflow-auto">
        {!viewMode ? (
          <>
            <Navbar />
            <HomeSection />
            <section
              id="try"
              className="w-screen h-[65vh] flex items-center flex-col space-y-8"
            >
              <PictureUploader
                setUploadedFiles={setUploadedFiles}
                setViewMode={setViewMode}
              />
            </section>

            <section
              id="faq"
              className="w-screen h-screen flex items-center justify-center "
            >
              <div className="w-full max-w-5xl h-full flex items-center justify-center">
                <Faq />
              </div>
            </section>
            <Footer />
          </>
        ) : (
          <ViewPage uploadedFiles={uploadedFiles} setViewMode={setViewMode} />
        )}
      </div>
    </div>
  );
};

export default App;
