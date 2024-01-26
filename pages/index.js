import Image from "next/image";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import localFont from "next/font/local";
import axios from "axios";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

const inter = Inter({ subsets: ["latin"] });
const proto = localFont({
  src: [
    {
      path: "../public/fonts/proto/ProtoMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/proto/ProtoMono-SemiBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export default function Home() {
  const [question, setQuestion] = useState("");
  const [thereWasAnError, setThereWasAnError] = useState("");
  const [askingTheQuestionStatus, setAskingTheQuestionStatus] = useState(false);
  const [weHaveResponse, setWeHaveResponse] = useState(false);
  const [castLink, setCastLink] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [questionAsked, setQuestionAsked] = useState(false);
  const [castResponse, setCastResponse] = useState({});
  const [timer, setTimer] = useState("");

  useEffect(() => {
    const asked = localStorage.getItem("questionAskedd");
    const link = localStorage.getItem("castLink");

    if (asked) {
      setQuestionAsked(true);
      setQuestion(asked); // Load the saved question
      if (link) {
        setCastLink(link);
      }
    }
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
      console.log("the timer is: ", timer);
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
      if (questionAsked) return alert("you already asked a question");
      if (!question || question?.length === 0)
        return alert("please ask a question");
      if (!twitterUsername) return alert("please add a twitter username");
      if (question.length > 280) return alert("please be more concise");
      setAskingTheQuestionStatus(true);
      console.log("sending the question...");
      const response = await axios.post("/api/farcaster", {
        prompt: question,
        twitterUsername: twitterUsername,
      });
      console.log(
        "it was successful. if you are reading this, please help me make this website cooler for each week"
      );
      localStorage.setItem("questionAskedd", question);
      localStorage.setItem(
        "castLink",
        `https://warpcast.com/${
          response.data.cast.author.username
        }/${response.data.cast.hash.substring(0, 10)}`
      );

      setCastResponse(response.data.cast);
      setAskingTheQuestionStatus(false);
      setWeHaveResponse(true);
    } catch (error) {
      setThereWasAnError(
        error?.response?.data?.error || "there was an unknown error"
      );
      setAskingTheQuestionStatus(false);
    }
  }
  if (questionAsked)
    return (
      <div
        className={`${proto.className} w-96 pt-4 mx-auto h-screen  flex flex-col`}
      >
        {weHaveResponse && <Fireworks autorun={{ speed: 3 }} />}
        <div className="mb-3 w-8/12 mx-auto">
          <div className="w-full aspect-square relative rounded-xl overflow-hidden">
            <Image src={`/images/jacek.jpeg`} layout="fill" />
            <div className="absolute top-0 right-0 bg-black text-white p-2">
              {timer}
            </div>
          </div>
        </div>

        <h2 className="w-full mx-auto text-center text-3xl">
          you already asked
        </h2>
        <p className="my-2 text-xl text-center">{question}</p>
        {castLink && (
          <a
            target="_blank"
            className={`p-2 text-2xl border-2 border-black rounded-xl w-fit mx-auto bg-purple-600 text-yellow`}
            href={castLink}
          >
            open in warpcast
          </a>
        )}
      </div>
    );
  return (
    <div
      className={`${proto.className} w-96 pt-2 mx-auto h-screen  flex flex-col mt-4`}
    >
      {weHaveResponse && <Fireworks autorun={{ speed: 3 }} />}
      <div className="mb-3 w-8/12 mx-auto">
        <div className="w-full aspect-square relative rounded-xl overflow-hidden">
          <Image src={`/images/jacek.jpeg`} layout="fill" />
          <div className="absolute top-0 right-0 bg-black text-white p-2">
            {timer}
          </div>
        </div>
      </div>
      <div className="h-3/5 w-full  mx-auto">
        {weHaveResponse ? (
          <div className="h-full w-4/5 mx-auto">
            <p className="mt-4">your question was asked</p>
            <div className="h-fit my-4">
              <a
                target="_blank"
                href={`https://warpcast.com/${
                  castResponse.author.username
                }/${castResponse.hash.substring(0, 10)}`}
                className={`p-2 text-2xl border-2 border-black rounded-xl bg-purple-600 text-yellow`}
              >
                open in warpcast
              </a>
            </div>

            <p>
              NOTE: the cast may take a while to appear. patience. we are all in
              line.
            </p>
          </div>
        ) : (
          <>
            <h2 className="w-full mx-auto text-center text-3xl">
              ask jacek anything
            </h2>

            <div>
              <div className="flex flex-col mt-2 w-5/6 mx-auto">
                <textarea
                  onChange={(e) => setQuestion(e.target.value)}
                  className="p-2 rounded-xl text-black w-full h-32"
                  placeholder="write here..."
                  value={question}
                />
                <span
                  className={`${
                    question.length > 320 ? "text-red-500" : "text-white"
                  } mt-1`}
                >
                  {question.length}/320
                </span>
                <p className="my-2">
                  twitter address (to send you the special box)
                </p>
                <input
                  className="p-2 rounded-xl"
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="@deezee"
                />
                {question?.length > 0 && twitterUsername.length > 0 && (
                  <button
                    disabled={question.length === 0}
                    onClick={askTheQuestion}
                    className={`${
                      question?.length > 0
                        ? "bg-purple-500 shadow-lg shadow-black shadow-yellow-600 hover:bg-purple-600"
                        : "bg-purple-300 "
                    } border-black w-48 mr-auto p-2 rounded-xl border-2 mx-auto text-black mt-4`}
                  >
                    {askingTheQuestionStatus
                      ? "broadcasting..."
                      : question?.length > 0
                      ? "ask anon"
                      : "submit"}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 w-3/4 mb-8 bg mx-auto">
              {thereWasAnError && (
                <p className="text-red-600 text-sm">{thereWasAnError}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
