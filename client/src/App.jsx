import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import UploadPage2 from "./pages/UploadPage2";
import ProtectedRoute from "./routes/ProtectedRoutes";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/uploadpage"
        element={
          <ProtectedRoute>
            <UploadPage2 />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
