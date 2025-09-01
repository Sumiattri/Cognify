import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className=" w-screen flex flex-col font-inter bg-gray-50">
      <header className="w-full p-4 bg-[#8D51FF] fixed text-white flex justify-between items-center shadow-md sm:px-15 px-5">
        <h1 className="text-xl font-stretch-expanded">NotebookLM</h1>
      </header>

      <main className="flex-1 overflow-auto ">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
