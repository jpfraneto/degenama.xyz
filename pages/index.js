import Image from "next/image";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import axios from "axios";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [question, setQuestion] = useState("");
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [askingTheQuestionStatus, setAskingTheQuestionStatus] = useState(false);
  const [weHaveResponse, setWeHaveResponse] = useState(false);
  const [castResponse, setCastResponse] = useState({});
  const [timer, setTimer] = useState("");

  useEffect(() => {
    const targetTime = new Date("January 26, 2024 14:00:00 EST").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimer(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimer("EXPIRED");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  async function askTheQuestion() {
    try {
      if (!question || question.length === 0)
        return alert("please ask a question");
      setAskingTheQuestionStatus(true);
      console.log("asking the question");
      const response = await axios.post("/api/farcaster", { prompt: question });
      console.log("the response is: ", response.data);
      setCastResponse(response.data.cast);
      setAskingTheQuestionStatus(false);
      setWeHaveResponse(true);
    } catch (error) {
      console.log("there was an error");
      setThereWasAnError(true);
    }
  }
  return (
    <div className="w-96 pt-8 mx-auto h-screen  flex flex-col">
      {weHaveResponse && <Fireworks autorun={{ speed: 3 }} />}
      <div className="h-2/5 w-4/5   mx-auto">
        <div className="w-full aspect-square relative rounded-xl overflow-hidden">
          <Image src={`/images/jacek.jpg`} layout="fill" />
          <div className="absolute top-0 right-0 bg-black text-white p-2">
            {timer}
          </div>
        </div>
      </div>
      <div className="h-3/5 w-3/4  mx-auto">
        {weHaveResponse ? (
          <div className="h-full ">
            <p className="mt-12">your question was asked</p>
            <div className="h-fit my-4">
              <a
                target="_blank"
                href={`https://warpcast.com/${
                  castResponse.author.username
                }/${castResponse.hash.substring(0, 10)}`}
                className={`p-2 border-2 border-black rounded-xl bg-purple-600 text-yellow`}
              >
                open in warpcast
              </a>
            </div>

            <p>
              NOTE: the cast may take a while to appear in warpcast. patience.
              we are all in line.
            </p>
          </div>
        ) : (
          <div className="mt-12">
            <p className="w-3/4 mx-auto text-center">ask jacek something</p>

            <div>
              <div className="flex flex-col  mt-4 w-3/4 mx-auto">
                <textarea
                  onChange={(e) => setQuestion(e.target.value)}
                  className="p-2 rounded-xl text-black w-full h-24"
                  placeholder="write here..."
                />
                <button
                  onClick={askTheQuestion}
                  className={`${
                    question.length > 0
                      ? "bg-purple-500 shadow-lg shadow-black hover:shadow-yellow-600"
                      : "bg-purple-300 "
                  } border-black w-48 mr-auto p-2 rounded-xl border-2 mx-auto text-black mt-4`}
                >
                  {askingTheQuestionStatus
                    ? "broadcasting..."
                    : question.length > 0
                    ? "ask anon"
                    : "start writing..."}
                </button>
              </div>
            </div>
            <div className="mt-4 w-3/4 bg mx-auto">
              {thereWasAnError && (
                <p className="text-red-600 text-sm">oops, there was an error</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
