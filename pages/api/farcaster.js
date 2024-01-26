export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
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
      console.log("the response from casting is: ", data);
      res.status(200).json({ cast: data.cast });
    } catch (error) {
      // Handle errors from the fetch operation
      console.error("Fetch error:", error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP methods if necessary
    res.setHeader("Allow", ["POST"]); // Ensure you set the 'Allow' header to 'POST' since that's the method you're accepting
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
