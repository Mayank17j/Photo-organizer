const {
  // photo: photoModel,
  // searchHistory: searchHistoryModel,
  // tag: tagModel,
  user: userModel,
} = require("../models");

//validate new user data
const validCreateUserData = async (newUserData) => {
  //console.log("log.fileService.validCreateUser.newUserData", newUserData);
  let errors = [];

  if (!newUserData.username?.trim()) errors.push("Username must be present"); //null safety: newUserData.username?.trim()

  //(newUserData.email && !validateEmail(newUserData.email))
  if (!validateEmail(newUserData.email)) errors.push("Email format is invalid!");

  //(newUserData.email && (await doesUserExist(newUserData.email))
  if (await doesUserExist(newUserData.email)) errors.push(`User exist with this email: ${newUserData.email}`);

  return errors;
};

//?NOTE: email validation, return true, false
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Check if a user with the given email already exists
const doesUserExist = async (email) => {
  try {
    //TODO: try doesUserExist at dataController
    const user = await userModel.findOne({ where: { email: email } });
    //NOTE
    return Boolean(user); // Return true if user exists
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false; // Default to false if an error occurs
  }
};

const validateTag = (tags) => {
  //console.log("log.fileService.validateTag.errors[0]", errors[0]);
  let errors = [];
  if (tags.length > 5 || tags.length < 1) {
    errors.push("Atmost 5 tags are require");
    return errors;
  }

  //changed
  tags.forEach((tag) => {
    if (tag.length > 20) {
      errors.push(`Each tag must not exceed 20 characters: "${tag}"`);
    }
  });
  return errors;
};

//validate new photo  imageUrl, tags, and userId
const validSavePhotosData = (newPhotoData) => {
  console.log("log.fileService.validSavePhotosData.newPhotoData", newPhotoData);
  let errors = [];

  if (!newPhotoData.imageUrl || !newPhotoData.imageUrl.startsWith("https://images.unsplash.com/"))
    errors.push("Invalid or missing image URL. It must be from Unsplash.");

  return errors;
};

module.exports = { validCreateUserData, validSavePhotosData, validateTag };
