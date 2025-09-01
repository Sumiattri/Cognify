import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoIosSend } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { IoCloseOutline } from "react-icons/io5";
import { Progress } from "@/components/ui/progress";
import { useRef } from "react";

import CloseChatModel from "./CloseChatModel";

function Chat({ viewerRef }) {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [loadingResponse, setLoadingResponse] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    if (!showProgress) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowProgress(false), 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [showProgress]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);
    try {
      setLoadingResponse(true);
      const res = await fetch(
        `https://notebooklm-6hyr.onrender.com/chat?message=${message}`
      );
      const data = await res.json();
      console.log(data);

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.message,
          metadata:
            data.docs?.[0]?.metadata?.loc?.pageNumber != null
              ? { pageNumber: data.docs[0].metadata.loc.pageNumber }
              : undefined,
        },
      ]);
      setLoadingResponse(false);
    } catch (err) {
      console.error("Error fetching AI response", err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "Something went wrong." },
      ]);
    }
    setMessage("");
  };

  function handleClick() {
    setIsModelOpen(true);
  }
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <>
      {showProgress ? (
        <div className="px-10 pt-5 w-[60%] mx-auto  mt-[40vh] flex flex-col gap-2">
          <p className="flex justify-between text-violet-600">
            <span className="font-semibold">Uploading </span>
            <span>{loadingProgress} %</span>
          </p>
          <Progress
            value={loadingProgress}
            className="h-2 [&>div]:bg-violet-600 "
          />
        </div>
      ) : (
        <div className="relative w-full h-full bg-white  ">
          {isModelOpen && (
            <CloseChatModel
              isModelOpen={isModelOpen}
              setIsModelOpen={setIsModelOpen}
            />
          )}
          {/* <div className=" absolute top-4 left-6 bg-black rounded-full p-1 ">
            <IoCloseOutline
              onClick={handleClick}
              className=" text-3xl text-white cursor-pointer"
            />
          </div> */}
          {chatHistory.length === 0 ? (
            <div className="w-full h-full  px-5 pt-5 ">
              <div className="sticky top-0 bg-white pt-">
                <div className="flex justify-between items-center pl-4 pr-2">
                  <p className="text-[17px]"> Chat</p>
                  <div className=" a bg-black rounded-full p-1 ">
                    <IoCloseOutline
                      onClick={handleClick}
                      className=" text-[22px] text-white cursor-pointer"
                    />
                  </div>
                </div>
                <hr className="mt-3" />
              </div>
              <div className=" pl-15 px-2 pt-2 pb-10 text-[#9D28EF] bg-[#F0E9EF]  mt-10 rounded-2xl">
                <div className="flex gap-2 items-center ">
                  <IoDocumentTextOutline className="sm:text-xl text-[17px]" />
                  <h1 className="sm:text-xl  text-[15px] font-semibold">
                    Your Document is ready
                  </h1>
                </div>
                <div className="sm:text-[15px] text-[13px] mt-3">
                  <p>
                    You can now ask questions about your document, For example:
                  </p>
                  <ul className="list-disc pl-5 [&>li::marker]:text-[#9D28EF] [&>li::marker]:text-sm [&>li::marker]:rounded-full pt-3">
                    <li>"What is the main topic of the document?"</li>
                    <li>"Can you summarize the document?"</li>
                    <li>"What are the conclusion or recommendations?"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0 flex flex-col max-h-[80vh] overflow-y-auto  px-2     ">
              <div className="sticky top-0 bg-white pt-3">
                <div className="flex justify-between items-center pl-5 pr-2">
                  <p className="text-[17px]"> Chat</p>
                  <div className=" a bg-black rounded-full p-1 ">
                    <IoCloseOutline
                      onClick={handleClick}
                      className=" text-[22px] text-white cursor-pointer"
                    />
                  </div>
                </div>
                <hr className="mt-3" />
                <div className="h-5 bg-white w-full sticky top-5 "></div>
              </div>

              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`px-4 py-3   ${
                    msg.sender === "user"
                      ? "bg-[#EDEFFA] sm:text-[14px] text-[13px] sm:max-w-[90%] max-w-full self-end rounded-l-3xl rounded-tr-lg sm:px-6 "
                      : "bg-white  sm:text-[14px] text-[13px]  sm:px-5 pt-10 pb-10 rounded-lg"
                  }`}
                >
                  <div className=" ">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    {msg.sender === "ai" && msg.metadata?.pageNumber && (
                      <button
                        onClick={() =>
                          viewerRef.current?.scrollToPage(
                            msg.metadata.pageNumber - 1
                          )
                        }
                        className="text-xs text-blue-600 mt-1 underline underline-offset-1 cursor-pointer hover:scale-105 transition-all duration-200 "
                      >
                        Source : Page {msg.metadata.pageNumber}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loadingResponse && (
                <div className="px-4 rounded-lg sm:text-[16px] text-[13px] sm:px-10">
                  <div className="flex justify-start items-center w-full py-6 gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                    </div>
                    {/* <p>Analyzing....</p> */}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="flex absolute bottom-3.5 w-full  bg-white pt-2  sm:px-5 px-2 sm:gap-5 gap-2 items-center">
            <Input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              placeholder="Type your query here"
              className=" bg-white py-6 border-black"
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={!message.trim()}
              className="bg-[#A1ABFF] cursor-pointer py-5 "
            >
              <IoIosSend className="text-5xl text-white my-10  " />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
