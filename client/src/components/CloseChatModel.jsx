import { RiErrorWarningLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

function CloseChatModel({ setIsModelOpen }) {
  const navigate = useNavigate();
  function handleClick() {
    localStorage.setItem("chatHistory", JSON.stringify(""));
    navigate("/", { replace: true });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div
        onClick={() => setIsModelOpen(false)}
        className="absolute inset-0 bg-black/40 z-9 cursor-pointer"
      ></div>
      <div className="w-110 bg-white  relative px-8 py-7 z-10 rounded-md shadow-md flex flex-col gap-3 ">
        <div className="flex items-center gap-2 ">
          <RiErrorWarningLine className="text-yellow-500 text-2xl" />
          <h1 className="text-xl font-semibold">Upload New PDF?</h1>
        </div>
        <div className="text-gray-500">
          This will end your current chat session. Are you sure you want to
          upload a new PDF?
        </div>
        <div className="flex justify-end items-center gap-2 mt-2">
          <button
            className="hover:bg-gray-300 p-2 rounded-md cursor-pointer text-gray-500"
            onClick={() => {
              setIsModelOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleClick}
            className="text-white bg-[#9334E9] hover:bg-[#9334E9]/85 p-2 rounded-md cursor-pointer"
          >
            Upload New PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default CloseChatModel;
