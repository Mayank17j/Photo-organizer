const axiosInstance = require("../lib/axios.lib");
const { json } = require("express");

const searchImages = async (req, res) => {
  try {
    console.log("LOG.userController.searchImages.req.query", req.query.query);
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const test_error = !!false; //false
    const rate_limit = !true; //false

    console.log("LOG.userController.searchImages.test_error", test_error);
    console.log("LOG.userController.searchImages.rate_limit", rate_limit);

    const response = await axiosInstance.get(`/search/photos`, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, //Case sensetive
        "Content-Type": "application/json",
      },
      params: {
        query: query, // The search term
        per_page: 2, // Number of photos to fetch (optional)
      },
    });
    // response {
    //   status: 200,
    //   statusText: 'OK',
    //   headers: Object [AxiosHeaders] {}
    //   data: {...}
    // }
    // console.log(
    //   "LOG.userController.searchImages.response.data.results, ",
    //   response.data.results
    // );
    if (response.data.results.length === 0)
      return res
        .status(404)
        .json({ message: `No images found for the given query: ${query}` });

    const photos = response.data.results.map((photo) => ({
      imageUrl: photo.urls.small, // URL of the image
      description: photo.description || "NA", // Description of the image
      altDescription: photo.alt_description || "NA", // Alternate description
    }));

    console.log("LOG.userController.searchImages.photos", photos);
    //data: { total: 0, total_pages: 0, results: [] }

    res.status(200).json({ photos: photos });
  } catch (error) {
    console.log("LOG.userController.searchImages.500", error);
    res
      .status(500)
      .json({ message: "Failed to fetch Images.", error: error.photos });

    /*
    response.data errors
    if (error.response.status === 429) {
      //test_error=true &rate_limit=true
      //test_error=false&rate_limit=true
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please again later!" });
    } else if (
      //test_error=true&rate_limit=false
      error.response.status === 500 &&
      error.response.data.error === "Simulated error for testing purposes."
    ) {
      return res
        .status(500)
        .json({ error: "Simulated error for testing purposes." });
    }
    //test_error=false&rate_limit=false
    //default condition error shown if it actual present in DB or server
*/
  }
};

module.exports = { searchImages };
