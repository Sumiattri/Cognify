import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  SignUp,
} from "@clerk/clerk-react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import UploadPage from "./pages/UploadPage";
import RootLayout from "./layouts/RootLayout";
import ChatPage from "./pages/ChatPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </>
  )
);

function App() {
  return (
    <>
      <SignedOut>
        <section className="h-screen w-screen flex items-center justify-center font-inter bg-gray-50">
          <SignUp />
        </section>
      </SignedOut>

      <SignedIn>
        <RouterProvider router={router} />
      </SignedIn>
    </>
  );
}

export default App;
