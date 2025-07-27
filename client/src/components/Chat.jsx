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
      const res = await fetch(`http://localhost:8000/chat?message=${message}`);
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
        <div className="relative w-full h-full bg-[#F0F0F5]  ">
          {isModelOpen && (
            <CloseChatModel
              isModelOpen={isModelOpen}
              setIsModelOpen={setIsModelOpen}
            />
          )}
          <div className=" absolute top-5 left-6 bg-[#8D51FF] rounded-full p-1 ">
            <IoCloseOutline
              onClick={handleClick}
              className=" text-3xl text-white cursor-pointer"
            />
          </div>
          {chatHistory.length === 0 ? (
            <div className="w-full h-full  px-5 pt-5 ">
              <div className=" pl-15 px-2 pt-2 pb-10 text-[#9D28EF] bg-[#FBF5FF] rounded ">
                <div className="flex gap-2 items-cente ">
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
            <div className="space-y-3 flex flex-col max-h-[80vh] overflow-y-auto  px-2 py-4    ">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`px-4 py-2  rounded-lg ${
                    msg.sender === "user"
                      ? "bg-violet-100 sm:text-[16px] text-[13px] sm:max-w-[90%] max-w-full self-end rounded-l-3xl sm:px-6 "
                      : "bg-white  sm:text-[16px] text-[13px]  sm:px-10 "
                  }`}
                >
                  <div className="">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    {msg.sender === "ai" && msg.metadata?.pageNumber && (
                      <button
                        onClick={() =>
                          viewerRef.current?.scrollToPage(
                            msg.metadata.pageNumber - 1
                          )
                        }
                        className="text-xs text-blue-600 mt-1 underline cursor-pointer hover:scale-105 transition-all duration-200"
                      >
                        Go to Page {msg.metadata.pageNumber}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loadingResponse && (
                <div className="px-4 rounded-lg sm:text-[16px] text-[13px] sm:px-10">
                  <div className="flex justify-start items-center w-full py-6 gap-2">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />{" "}
                    <p>Analyzing....</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="flex absolute bottom-3.5 w-full md:px-10 sm:px-5 px-2 sm:gap-5 gap-2 items-center">
            <Input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              placeholder="Type your query here"
              className=" bg-white py-5"
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={!message.trim()}
              className="bg-violet-500 cursor-pointer py-5 "
            >
              <IoIosSend className="text-5xl my-10" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
