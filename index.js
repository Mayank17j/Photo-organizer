const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { sequelize } = require("./models");

app.use(cors());
app.use(express.json());

//MS1_Assignment_1.1: Setting Up the Project

//TEST REQUEST at axios.lib.js
//const axios = require("axios");
// axios
//   .get("https://api.unsplash.com/photos", {
//     headers: {
//       Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
//     },
//   })
//   .then((response) => console.log("Test request successful:", response.data))
//   .catch((error) => console.error("Test request failed:", error.message));

const axiosInstance = require("./lib/axios.lib");
//console.log("Log.index.axiosInstance.SET");
axiosInstance
  .get(`/photos`)
  .then((response) => console.log("Log.index.axiosInstance.SUCCESS.RESULT, FIRST PHOTO.ID =", response.data[0]?.id))
  .catch((error) =>
    console.log({
      message: "LOG.Error fetching axiosInstance health",
      error: error.message,
    })
  );

const { saveUser, getUserById, savePhotos, saveTags, getPhotosByTag, getSearchHistoryByUser } = require("./controllers/dataController.js");
app.get("/user/:id", getUserById);
const { searchImages } = require("./controllers/userController.js");

//MS1_Assignment_1.2: Making API Calls to create Users ...
/*
{
  'username': 'newUser',
  'email': 'newuser@example.com'
}
*/
app.post("/user", saveUser);

/*
MS1_Assignment_1.3: Making API Calls to Unsplash
Create a new GET endpoint to search for photos from the Unsplash API based on a user-provided search term.
*/
//http://localhost:3000/search/photos?query=nature
app.get("/search/photos", searchImages);

/*
MS1_Assignment_1.4: Saving Photos into Collections
{
  'imageUrl': '<https://images.unsplash.com/photo->...',
  'description': 'Beautiful landscape',
  'altDescription': 'Mountain view',
  'tags': ['nature', 'mountain'],
  'userId': 1
}
*/
app.post("/photos", savePhotos);

/*
MS1_Assignment_1.5: Adding Tags for Photos
{
  'tags': ['newTag1', 'newTag2']
}
*/
app.post("/photos/:photoId/tags", saveTags);

/*
MS1_Assignment_1.6: Searching Photos by Tags and Sorting by Date Saved
API:/photos/tag/search?tags=mountain&sort=ASC&userId=1
*/
app.get("/photos/tag/search", getPhotosByTag);

/*
MS1_Assignment_1.7: Tracking and Displaying Search History
API: /search-history?userId=1
*/
app.get("/search-history", getSearchHistoryByUser);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Unable to connect database", error);
  });

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
