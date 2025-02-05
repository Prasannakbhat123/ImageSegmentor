import React, { useEffect, useState } from 'react';

const HomeSection = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText =
    "Welcome to the Image Segmenter Tool! Easily upload and manage your images here.";
    const navbar = document.querySelector('nav');

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval); // Stop the interval when done
      }
    }, 100); // Adjust speed of text animation

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);
  return (
    <div className="h-[10vh] flex items-center justify-center bg-[#003566] mt-16">
      <h1 className="text-3xl font-bold">{displayText}</h1>
    </div>
  );
};

export default HomeSection;
