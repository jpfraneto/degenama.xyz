const prisma = require("../../lib/prismaClient");

export default async function handler(req, res) {
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (req.method === "POST") {
    try {
      let savedQuestion;
      const existingEntry = await prisma.requestLog.findFirst({
        where: {
          ip: clientIp,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingEntry) {
        return res
          .status(429)
          .json({ error: "you already submitted a question." });
      }

      const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: process.env.MFGA_API_KEY,
        },
        body: JSON.stringify({
          text: req.body.prompt,
          signer_uuid: process.env.MFGA_SIGNER_UUID,
          parent: process.env.AMA_CAST_HASH,
        }),
      });

      if (!response.ok) {
        // If the response has an HTTP status code that indicates an error, throw an error
        throw new Error(`Error from API: ${response.status}`);
      }

      const data = await response.json();
      try {
        savedQuestion = await prisma.question.create({
          data: {
            question: req.body.prompt,
            twitterUsername: req.body.twitterUsername, // Assuming you send this from frontend
            castHash: data.cast.hash, // Adjust based on actual response structure
          },
        });
      } catch (error) {
        if (err.code === "P2002") {
          // This is the error code for a unique constraint violation in Prisma
          return res.status(400).json({
            error: "this twitter username is already participating",
          });
        }
        throw err;
      }
      await prisma.requestLog.create({
        data: {
          ip: clientIp,
        },
      });
      console.log("the question was saved", savedQuestion);
      res.status(200).json({ cast: data.cast });
    } catch (error) {
      // Handle errors from the fetch operation

      console.error("Fetch error:", error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP methods if necessary
    res.setHeader("Allow", ["POST"]); // Ensure you set the 'Allow' header to 'POST'
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
