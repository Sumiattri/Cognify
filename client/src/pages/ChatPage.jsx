import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Worker } from "@react-pdf-viewer/core";
import Chat from "../components/Chat";
import ViewPDF from "../components/ViewPDF";

function ChatPage() {
  const location = useLocation();
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [originalFileName, setOriginalFileName] = useState(null);

  const viewerRef = useRef(null);

  useEffect(() => {
    if (location.state && location.state.uploadedFilename) {
      setUploadedFilename(location.state.uploadedFilename);
      setOriginalFileName(
        location.state.originalFileName || "Uploaded Document"
      );
    }
  }, [location.state]);

  return (
    <div className="w- h-[calc(100vh-60px)] relative z-10 flex border mt-15">
      <div className="sm:w-[50%] w-[100%] h-full">
        <Chat viewerRef={viewerRef} />
      </div>
      <div className="w-[50%] h-full border border-l-4 sm:block hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <ViewPDF
            uploadedFilename={uploadedFilename}
            originalFileName={originalFileName}
            viewerRef={viewerRef}
          />
        </Worker>
      </div>
    </div>
  );
}

export default ChatPage;
