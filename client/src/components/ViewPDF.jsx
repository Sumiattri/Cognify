import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useEffect } from "react";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function ViewPDF({ uploadedFilename, originalFileName, viewerRef }) {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const pdfUrl = uploadedFilename || "";

  useEffect(() => {
    if (viewerRef) {
      viewerRef.current = {
        scrollToPage: (pageIndex) => jumpToPage(pageIndex),
      };
    }
  }, [jumpToPage]);

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex-1">
        {pdfUrl ? (
          <div className="h-[calc(100vh-60px)] overflow-y-auto">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[
                pageNavigationPluginInstance,
                defaultLayoutPluginInstance,
              ]}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-center p-4">
            <p>Upload a PDF to view it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewPDF;
