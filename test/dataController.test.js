//MS1_Assignment_1.8: Writing Unit and Integration Tests

//npm install jest
//npm run test
const { Op } = require("sequelize");

const {
  photo: photoModel,
  searchHistory: searchHistoryModel,
  tag: tagModel,
  user: userModel,
} = require("../models");

const {
  createTags, //TODO:implement
  saveUser,
  savePhotos,
  saveTags,
  getUserById,
  getPhotosByTag,
  getSearchHistoryByUser,
} = require("../controllers/dataController");

const {
  validCreateUserData,
  validSavePhotosData,
  validateTag,
} = require("../service/fileService.js");

jest.mock("../models", () => ({
  user: { findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  tag: { findAll: jest.fn(), create: jest.fn() },
  photo: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  searchHistory: { create: jest.fn(), findAll: jest.fn() },
}));

jest.mock("../lib/axios.lib.js", () => ({
  //get: jest.fn(),
  createTags: jest.fn(),
  saveUser: jest.fn(),
  savePhotos: jest.fn(),
  saveTags: jest.fn(),
  getUserById: jest.fn(),
  getPhotosByTag: jest.fn(),
  getSearchHistoryByUser: jest.fn(),
}));

jest.mock("../service/fileService", () => ({
  validCreateUserData: jest.fn(),
  validSavePhotosData: jest.fn(),
  validateTag: jest.fn(),
}));

//UNIT TESTING: Unit tests focus on testing individual components or functions in isolation, without external dependencies like databases, APIs, or file systems. And Control the return value of the function.
//?NOTE: Integration Tests Not currently required: mock mini end-to-end testing by mock DB and API call
describe("Unit test for Data Controller Functions", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("1. saveUser", () => {
    it("1. should return 400 if username is missing", async () => {
      req.body = { email: "test@example.com" };
      await saveUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username must be present to create new user!",
      });
    });

    it("2. should return 400 if email is missing", async () => {
      req.body = { username: "testuser" };
      await saveUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email must be present to create new user!",
      });
    });

    it("3. should return 201 if user is created successfully", async () => {
      req.body = { username: "testuser", email: "test@example.com" };
      validCreateUserData.mockResolvedValue([]);
      userModel.create.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
      });

      await saveUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: expect.any(Object),
      });
    });

    it("4. should return 500 if there is an internal error", async () => {
      req.body = { username: "testuser", email: "test@example.com" };
      validCreateUserData.mockResolvedValue([]);
      userModel.create.mockRejectedValue(new Error("Database error"));

      await saveUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to create user!",
        error: "Database error",
      });
    });
  });

  describe("2. savePhotos", () => {
    it("1. should return 400 if request body is missing", async () => {
      req = { params: {}, query: {} };
      await savePhotos(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "save photo query must be present!",
      });
    });

    it("2. should return 400 if validation fails", async () => {
      req.body = { imageUrl: "url", userId: 1, tags: [] };
      validSavePhotosData.mockReturnValue(["Invalid data"]);

      await savePhotos(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Photo data is invalid!",
        errors: ["Invalid data"],
      });
    });
    //TODO:debug savePhotos with req.body data
    it("3. should return 404 if userId does not exist", async () => {
      req.body = {
        imageUrl: "https://images.unsplash.com/abc",
        userId: 1,
        tags: ["mountain"],
      };
      userModel.findOne.mockResolvedValue(null);
      validSavePhotosData.mockReturnValue([]); //?: getting validation error for valid Input check it. Validation error should not be present so, no need to mock it

      await savePhotos(req, res);
      //expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User ID not found." });
    });

    it("4. should return 201 if photo is created successfully", async () => {
      req.body = {
        imageUrl: "https://images.unsplash.com/",
        userId: 20,
        tags: ["nature", "mountain"],
      };
      userModel.findOne.mockResolvedValue(req.body.userId);
      photoModel.create.mockResolvedValue(req.body);
      validateTag.mockReturnValue([]);
      tagModel.create.mockResolvedValue({
        name: req.body.tags,
        photoId: 7,
      });

      await savePhotos(req, res);
      //expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        photo: expect.any(Object),
      });
    });

    it("5. should return 500 if there is an internal error", async () => {
      req.body = { imageUrl: "url", userId: 1, tags: [] };
      userModel.findOne.mockRejectedValue(new Error("Database error"));

      await savePhotos(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to create user!",
        error: "Database error",
      });
    });
  });

  describe("3. saveTags", () => {
    it("1. should return 400 if tags are invalid", async () => {
      req.params.photoId = "1";
      req.body.tags = [];

      await saveTags(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Tags must be non-empty strings",
      });
    });

    it("2. should return 404 if photoId does not exist", async () => {
      req.params.photoId = "1";
      req.body.tags = ["nature"];
      photoModel.findByPk.mockResolvedValue(null);

      await saveTags(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Photo ID not found." });
    });
    /*
    it("should return 201 if tags are created successfully", async () => {
      const photoId = (req.params.photoId = 1);
      const tags = (req.body.tags = ["nature"]);
      photoModel.findByPk.mockResolvedValue(req.params.photoId);
      //createTags.mockResolvedValue(1, ["nature"]); since it takes multiple arguments
      createTags.mockImplementation(1, ["nature"]);

      await saveTags(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tags added successfully",
        tags: ["nature"],
      });
    });
    */
  });

  describe("4. getUserById", () => {
    // afterEach(() => {
    //   jest.clearAllMocks();
    // });

    test("1: getUserById should fetch user by userId", async () => {
      const mockUser = {
        id: 3,
        username: "Mayank Jaiswal",
        email: "mayank17j@gmail.com",
      };
      userModel.findByPk.mockResolvedValue(mockUser);

      const req = { params: { id: 3 } };
      const res = { json: jest.fn(), status: jest.fn(() => res) };
      await getUserById(req, res);

      expect(userModel.findByPk).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    test("2: getUserById should 404 if user ", async () => {
      userModel.findByPk.mockResolvedValue(null);

      const req = { params: { id: 2 } };
      const res = { json: jest.fn(), status: jest.fn(() => res) };
      await getUserById(req, res);

      expect(userModel.findByPk).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: `No user data found!` });
    });

    test("3: getUserById should 500 if user ", async () => {
      userModel.findByPk.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: 3 } };
      const res = { json: jest.fn(), status: jest.fn(() => res) };
      await getUserById(req, res);

      expect(userModel.findByPk).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: `Failed to retrieve User!`,
      });
    });
  });

  describe("5. getPhotosByTag", () => {
    test("1: getPhotosByTag should fetch all photos by tag", async () => {
      // /photos/tag/search?tags=mountain&sort=ASC&userId=3
      const req = { query: { tags: "mountain", sort: "ASC", userId: 3 } };

      const mockUser = { id: 3, name: "John Doe" };
      const mockTags = [
        { dataValues: { photoId: 1, name: ["mountain"] } },
        { dataValues: { photoId: 2, name: ["mountain"] } },
      ];
      const mockPhotos = [
        {
          id: 1,
          imageUrl: "url1",
          description: "Nature Photo",
          dateSaved: "2023-01-01",
          tags: [{ name: "mountain" }],
        },
        {
          id: 2,
          imageUrl: "url2",
          description: "Landscape Photo",
          dateSaved: "2023-01-02",
          tags: [{ name: "mountain" }, { name: "landscape" }],
        },
      ];
      const mockSearchHistory = { userId: 3, query: "mountain" };

      userModel.findByPk.mockResolvedValue(mockUser); // User exists
      tagModel.findAll.mockResolvedValue(mockTags); // Tags found
      photoModel.findAll.mockResolvedValue(mockPhotos); // Photo found
      searchHistoryModel.create.mockResolvedValue(mockSearchHistory); // Search history created
      const transformedPhotoResult = mockPhotos.map((photo) => ({
        imageUrl: photo.imageUrl,
        description: photo.description,
        dateSaved: photo.dateSaved,
        tags: photo.tags.map((tag) => tag.name), // to extract only the tag names
      }));

      await getPhotosByTag(req, res);

      expect(tagModel.findAll).toHaveBeenCalledWith({
        where: { name: "mountain" },
        attributes: ["photoId"],
      });
      expect(photoModel.findAll).toHaveBeenCalledWith({
        where: { id: { [Op.in]: [1, 2] } },
        order: [["dateSaved", "ASC"]],
        attributes: ["imageUrl", "description", "dateSaved"],
        include: [
          {
            model: tagModel,
            attributes: ["name"],
          },
        ],
      });
      expect(searchHistoryModel.create).toHaveBeenCalledWith(mockSearchHistory);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        photos: transformedPhotoResult,
      });
    });
    it("2: getPhotosByTag should return 400 if tags are invalid", async () => {
      const req = { query: { tags: "" } };
      //req.query.tags = null; // Simulate invalid tags

      await getPhotosByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid tag" });
    });
    it("3: getPhotosByTag should return 404 if user is not found", async () => {
      const req = {
        query: { tags: ["nature", "landscape"], sort: "ASC", userId: 999 },
      };
      //req.query.tags = ["nature", "landscape"];
      //req.query.userId = "123"; // Simulate valid userId
      userModel.findByPk.mockResolvedValue(null); // Mock user not found

      await getPhotosByTag(req, res);

      expect(userModel.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No user data found by userId: 999!",
      });
    });
    it("4: getPhotosByTag should return 404 if no photos are found by tags", async () => {
      const req = {
        query: { tags: "Wild life", sort: "ASC", userId: 3 },
      };
      //req.query.tags = ["nature", "landscape"];
      //req.query.userId = "123"; // Simulate valid userId
      //const mockUser = { id: 3, name: "John Doe" };
      userModel.findByPk.mockResolvedValue(req.query.userId); // Mock user found
      tagModel.findAll.mockResolvedValue([]); // Mock no tags found
      //const photoIds = tagObjects.map((tag) => tag.dataValues.photoId);

      await getPhotosByTag(req, res);

      expect(tagModel.findAll).toHaveBeenCalledWith({
        where: { name: "Wild life" },
        attributes: ["photoId"],
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Photo not found by tags: Wild life!",
      });
    });
    it("5: getPhotosByTag should return 500 if an error occurs", async () => {
      const req = {
        query: { tags: ["nature", "landscape"], sort: "ASC", userId: 3 },
      };
      // req.query.tags = ["nature", "landscape"];
      // req.query.userId = "123"; // Simulate valid userId
      userModel.findByPk.mockRejectedValue(new Error("Database error")); // Mock database error

      await getPhotosByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch photos by tag!",
      });
    });
  });

  describe("6. getSearchHistoryByUser", () => {
    test("1: getSearchHistoryByUser should fetch search history by userId", async () => {
      //  /search-history?userId=3
      //req.query.userId = 3; // Simulate valid userId
      //const mockUser = { id: 3, name: "John Doe" };
      const req = { query: { userId: 3 } };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res),
      };

      const mockSearchHistory = {
        id: 3,
        query: "mountain",
        userId: 3,
      };
      userModel.findByPk.mockResolvedValue(req.query.userId);
      searchHistoryModel.findAll.mockResolvedValue(mockSearchHistory);

      await getSearchHistoryByUser(req, res);

      expect(userModel.findByPk).toHaveBeenCalledWith(3);
      expect(searchHistoryModel.findAll).toHaveBeenCalledWith({
        where: { userId: 3 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        searchHistory: mockSearchHistory,
      });
    });

    it("2: getSearchHistoryByUser should return 400 if userId is invalid", async () => {
      //req.query.userId = null; // Simulate invalid userId
      const req = { query: {} };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res),
      };

      await getSearchHistoryByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "UserId is invalid!" });
    });

    it("3: getSearchHistoryByUser should return 404 if user is not found", async () => {
      //req.query.userId = 999; // Simulate valid userId
      userModel.findByPk.mockResolvedValue(null); // Mock user not found

      const req = { query: { userId: 999 } };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res),
      };
      await getSearchHistoryByUser(req, res);

      expect(userModel.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No user data found by userId: 999!",
      });
    });

    it("4: getSearchHistoryByUser should return 500 if an error occurs", async () => {
      //req.query.userId = "123"; // Simulate valid userId

      const req = { query: { userId: 9 } };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res),
      };
      userModel.findByPk.mockRejectedValue(new Error("Database error")); // Mock database error

      await getSearchHistoryByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve User History",
      });
    });
  });
});

//NOTE:
/*
jest.mock("../lib/axios.lib.js", () => ({
  ...jest.requireActual("../lib/axios.lib.js"), // Keeps real implementations
  get: jest.fn(), // Mocks only `get` and other func not mocked if available
  post: jest.fn(),
}));
*/
