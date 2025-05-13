//import models
let { Op } = require("@sequelize/core");
const {
  photo: photoModel,
  searchHistory: searchHistoryModel,
  tag: tagModel,
  user: userModel,
} = require("../models");
const {
  validCreateUserData,
  validSavePhotosData,
  validateTag,
} = require("../service/fileService.js");
const {
  attribute,
} = require("@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js");

//saveUser
const saveUser = async (req, res) => {
  const { username, email } = req.body;
  if (!username)
    return res
      .status(400)
      .json({ error: "Username must be present to create new user!" });
  if (!email)
    return res
      .status(400)
      .json({ error: "Email must be present to create new user!" });

  try {
    const errors = await validCreateUserData(req.body);
    console.log("LOG.dataController.saveUser.isValidData", errors);
    if (errors.length > 0) return res.status(400).json({ errors: errors });

    const newUser = await userModel.create(req.body);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.log("LOG.dataController.saveUser.500", error);
    res
      .status(500)
      .json({ message: "Failed to create user!", error: error.message });
  }
};

//savePhotos for userId
const savePhotos = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ error: "save photo query must be present!" });
  try {
    let errors = validSavePhotosData(req.body);
    if (errors.length > 0)
      return res
        .status(400)
        .json({ message: "Photo data is invalid!", errors: errors });
    console.log("LOG.dataController.savePhotos.isValidData", errors);
    const { imageUrl, description, altDescription, tags, userId } = req.body;

    //validate userId
    const user = await userModel.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User ID not found." });
    }

    //if (tags && validateTag(tags).length > 0)
    if (tags) {
      const errors = validateTag(tags);
      if (errors.length > 0)
        return res
          .status(400)
          .json({ message: "Tags data is invalid!", errors: errors });
      console.log("LOG.dataController.saveTags.errors", errors);
    }

    const newPhoto = await photoModel.create({
      imageUrl: imageUrl,
      description: description,
      altDescription: altDescription,
      userId: userId,
    });
    console.log(
      "LOG.dataController.newPhoto.dataValues.id",
      newPhoto.dataValues
    );

    console.log("LOG.dataController.newPhoto", newPhoto.dataValues);

    const response = await createTags(tags, newPhoto.dataValues);
    if (!response)
      return res
        .status(400)
        .json({ message: "Unable to create tags!", response });
    console.log("LOG.dataController.savePhotos.response", response);

    res
      .status(201)
      .json({ message: "User created successfully", photo: newPhoto });
  } catch (error) {
    console.log("LOG.dataController.newPhoto.500", error);
    res
      .status(500)
      .json({ message: "Failed to create user!", error: error.message });
  }
};

//saveTags /photos/:photoId/tags
const saveTags = async (req, res) => {
  //NOTE: app.post("/photos/:photoId/tags", saveTags) //req.params=req.params.photoId

  const photoId = req.params.photoId;
  const tags = req.body.tags;
  console.log("LOG.dataController.saveTags.photoId, tags", photoId, tags);
  if (!Array.isArray(tags) || !tags.length > 0)
    return res.status(400).json({ error: "Tags must be non-empty strings" });
  if (!photoId)
    return res
      .status(400)
      .json({ error: "photoId is invalid or not present!" });

  try {
    //validate existance of photoId
    const photo = await photoModel.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo ID not found." });
    }

    const errors = validateTag(tags);
    if (errors.length > 0)
      return res
        .status(400)
        .json({ message: "Tags data is invalid!", errors: errors });
    console.log("LOG.dataController.saveTags.errors", errors);

    const response = await createTags(tags, photoId);
    if (!response)
      return res
        .status(400)
        .json({ message: "Unable to create tags!", response });
    console.log("LOG.dataController.saveTags.response", response);

    res.status(201).json({ message: "Tags added successfully", tags: tags });
  } catch (error) {
    console.log("LOG.dataController.saveTags.500", error);
    res
      .status(500)
      .json({ message: "Failed to create tags!", error: error.message });
  }
};

//createTag
const createTags = async (tags, photoId) => {
  //tags.map((tag) => tagModel.create
  for (const tag of tags) {
    const saveTag = await tagModel.create({
      name: tag,
      photoId: photoId,
    });
    console.log(
      "LOG.dataController.saveTags.saveTag.dataValues",
      saveTag.dataValues
    );
  }
  return tags;
};

//getPhotosByTag /photos/tag/search?tags=mountain&sort=ASC&userId=1
const getPhotosByTag = async (req, res) => {
  const { tags, order = "ASC", userId } = req.query;

  if (!tags || tags.length > 20)
    return res.status(400).json({ error: "Invalid tag" });
  try {
    //validate existance of userId
    const user = await userModel.findByPk(userId);
    if (!user)
      return res
        .status(404)
        .json({ error: `No user data found by userId: ${userId}!` });

    console.log(
      "LOG.dataController.getPhotosByTag.tags,sort,userId: ",
      tags,
      order,
      userId
    );

    const tagObjects = await tagModel.findAll({
      where: { name: tags },
      attributes: ["photoId"],
    });
    if (tagObjects.length === 0)
      return res
        .status(404)
        .json({ message: `Photo not found by tags: ${tags}!` });
    console.log(
      "LOG.dataController.getPhotosByTag.tagObjects.dataValues",
      tagObjects
    );

    const photoIds = tagObjects.map((tag) => tag.dataValues.photoId);
    console.log("LOG.dataController.getPhotosByTag.photoIds", photoIds);

    const photos = await photoModel.findAll({
      where: { id: { [Op.in]: photoIds } },
      order: [["dateSaved", order]],
      attributes: ["imageUrl", "description", "dateSaved"],
      include: [
        {
          model: tagModel,
          attributes: ["name"],
        },
      ],
    });

    const transformedPhotoResult = photos.map((photo) => ({
      imageUrl: photo.imageUrl,
      description: photo.description,
      dateSaved: photo.dateSaved,
      tags: photo.tags.map((tag) => tag.name), // Extract only the tag names
    }));

    //searchHistoryModel
    const newSearchHistory = await searchHistoryModel.create({
      userId,
      query: tags,
    });
    if (!newSearchHistory)
      return res
        .status(404)
        .json({ message: `Unable to create search history!` });
    //console.log("LOG.dataController.newSearchHistory", newSearchHistory);

    res.status(200).json({ photos: transformedPhotoResult });
  } catch (error) {
    console.log("LOG.dataController.getPhotosByTag.500", error);
    res.status(500).json({ error: `Failed to fetch photos by tag!` });
  }
};

//getSearchHistoryByUser API: /search-history?userId=3
//?NOTE:
const getSearchHistoryByUser = async (req, res) => {
  const { userId } = req.query; //?userId=3
  if (!userId) return res.status(400).json({ error: "UserId is invalid!" });

  try {
    const user = await userModel.findByPk(userId);
    console.log("LOG.dataController.getSearchHistoryByUser.userId", userId);
    if (!user)
      return res
        .status(404)
        .json({ error: `No user data found by userId: ${userId}!` });
    console.log("LOG.dataController.getSearchHistoryByUser.user", user);

    const searchHistoryResult = await searchHistoryModel.findAll({
      where: { userId: userId },
    });
    console.log(
      "LOG.dataController.getSearchHistoryByUser.searchHistoryResult",
      searchHistoryResult
    );

    res.status(200).json({ searchHistory: searchHistoryResult });
  } catch (error) {
    console.log("LOG.dataController.getSearchHistoryByUser.500", error);
    res.status(500).json({ error: `Failed to retrieve User History` });
  }
};

//getUserById
const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: `Invalid id!` });

  try {
    const user = await userModel.findByPk(id);
    if (!user) return res.status(404).json({ error: `No user data found!` });
    console.log("LOG.dataController.getUserById.user", user);

    res.status(200).json({ user: user });
  } catch (error) {
    console.log("LOG.dataController.getUserById.500", error);
    res.status(500).json({ error: `Failed to retrieve User!` });
  }
};

module.exports = {
  saveUser,
  savePhotos,
  saveTags,
  getUserById,
  getPhotosByTag,
  getSearchHistoryByUser,
  createTags,
};
