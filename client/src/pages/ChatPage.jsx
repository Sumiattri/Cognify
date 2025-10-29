import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Worker } from "@react-pdf-viewer/core";
import Chat from "../components/Chat";
import ViewPDF from "../components/ViewPDF";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Brain } from "lucide-react";

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
    <div className="min-h-screen bg-[#EDEFFA]">
      <nav className=" sticky top-0 bg-[#EDEFFA]  z-50 ">
        <div className="max-w-8xl  mx-auto px-4  sm:px-6 lg:px-8 lg:pr-10">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-[28px]  text-black">Cognify</span>
            </div>
            <div className="flex items-center space-x-8">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>
      <div className="h-[91vh]  relative z-10 flex border gap-5 px-5 py-1 ">
        <div className="sm:w-[50%] w-[100%] rounded-2xl   overflow-clip  h-full">
          <Chat viewerRef={viewerRef} />
        </div>
        <div className="w-[50%] h-full  rounded-lg  overflow-clip  border-l-4 sm:block hidden">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <ViewPDF
              uploadedFilename={uploadedFilename}
              originalFileName={originalFileName}
              viewerRef={viewerRef}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
