import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ProtectedRoute from "./routes/ProtectedRoutes";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/uploadpage"
        element={
          <ProtectedRoute>
            <UploadPage />
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
