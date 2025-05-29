A web application for discovering, organizing, and tagging photos using the Unsplash API.

## Features

- Search for photos using Unsplash API
- Create and manage user accounts
- Save photos to collections
- Add custom tags to photos
- Search photos by tags
- Track and display search history
- Sort photos by date saved

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: Sequelize (SQLite)
- **API**: Unsplash
- **Testing**: Testing framework

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mayank17j/Photo-organizer.git
   cd Photo-organizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Unsplash API key:
   ```
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   ```

4. Set up the database:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Documentation

### User Management
- `POST /user` - Create a new user
- `GET /user/:id` - Get user by ID

### Photo Operations
- `GET /search/photos?query={term}` - Search photos on Unsplash
- `POST /photos` - Save photo to collection
- `POST /photos/:photoId/tags` - Add tags to a photo
- `GET /photos/tag/search?tags={tag}&sort={ASC|DESC}&userId={id}` - Search photos by tag

### Search History
- `GET /search-history?userId={id}` - Get user's search history

## Database Models

### User
- Stores user information (username, email)
- Has many Photos

### Photo
- Stores photo details (imageUrl, description, altDescription)
- Belongs to User
- Has many Tags

### Tag
- Stores tag names associated with photos
- Belongs to Photo

### SearchHistory
- Tracks user search queries
- Belongs to User

## Development

### Running the Server
```bash
npm start
```

### Running Tests
```bash
npm test
```

## Environment Variables
- `UNSPLASH_ACCESS_KEY`: Your Unsplash API access key
- `PORT`: Server port (default: 4001)

## Project Structure
```
picstoria/
├── controllers/          # Route controllers
│   ├── dataController.js # Database operations
│   └── userController.js # Unsplash API operations
├── models/               # Sequelize models
├── service/              # Business logic
│   └── fileService.js    # Validation services
├── lib/                  # Library files
│   └── axios.lib.js      # Axios configuration
├── index.js              # Main application file
└── .env                  # Environment variables
```

## API Examples

### Create User
```bash
curl -X POST http://localhost:4001/user \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com"}'
```

### Search Photos
```bash
curl "http://localhost:4001/search/photos?query=nature"
```

### Save Photo
```bash
curl -X POST http://localhost:4001/photos \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-...",
    "description": "Beautiful landscape",
    "altDescription": "Mountain view",
    "tags": ["nature", "mountain"],
    "userId": 1
  }'
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- [Unsplash](https://unsplash.com/) for their free photo API
- Sequelize for ORM support
- Express for the web framework
