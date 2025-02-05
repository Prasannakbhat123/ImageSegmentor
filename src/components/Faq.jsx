import { useState } from "react";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the Image Segmenter Tool?",
      answer:
        "The Image Segmenter Tool is an AI-powered tool that allows you to separate objects from backgrounds in an image using advanced segmentation techniques.",
    },
    {
      question: "How does the tool work?",
      answer:
        "The tool processes an image using deep learning models to identify and segment objects, highlighting or removing specific parts based on user preferences.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "You can upload images in PNG, JPG, and JPEG formats for segmentation.",
    },
    {
      question: "Can I adjust the segmentation accuracy?",
      answer:
        "Yes! The tool provides options to refine the segmentation by adjusting sensitivity, mask transparency, and smoothing effects.",
    },
    {
      question: "Is this tool free to use?",
      answer:
        "Yes, the basic features are free to use. However, advanced segmentation features may require a premium plan.",
    },
  ];

  return (
    <div className="w-screen mx-auto p-6 bg-blue-100 rounded-lg shadow-lg relative overflow-hidden h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Frequently Asked Questions</h2>

      {/* FAQ List */}
      <div className="space-y-4 max-h-[400px] overflow-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <button
              className="w-full text-left font-semibold flex justify-between items-center"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* How to Use Section */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-3">How to Use the Tool?</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Upload an image by clicking on the "Upload" button.</li>
          <li>The tool will process the image and highlight objects.</li>
          <li>Use the settings panel to refine the segmentation as needed.</li>
          <li>Preview the segmented image before downloading.</li>
          <li>Click "Download" to save the segmented image.</li>
        </ol>
      </div>
    </div>
  );
};

export default Faq;
