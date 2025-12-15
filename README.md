# KitchenMate - AI Culinary Assistant

KitchenMate is an intelligent culinary assistant powered by AI, designed to help users with cooking techniques, recipes, ingredient knowledge, and kitchen-related queries. Built with a modern React frontend and a FastAPI backend, KitchenMate provides an intuitive chat interface for culinary guidance.

## 🔍 Features

- **Intelligent Recipe Assistance**: Get detailed recipes, cooking techniques, and meal preparation guidance
- **Ingredient Knowledge**: Learn about ingredients, substitutions, and alternatives
- **Kitchen Tools & Equipment**: Get advice on kitchen tools and operations
- **Menu Planning**: Receive help with meal planning and culinary methods
- **Modern Chat Interface**: Beautiful, responsive UI with dark/light mode support
- **Chat History**: Save and manage your previous conversations
- **Real-time Responses**: Fast and accurate AI-powered responses

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing

### Backend
- **FastAPI** - Modern Python web framework
- **Ollama** - Local LLM runtime
- **Llama 3.2** - Base AI model
- **Custom Model (ChefMate)** - Fine-tuned for culinary expertise

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** - [Install Ollama](https://ollama.ai/)
- **npm** or **yarn** package manager

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "JUMAOAS, ROINCE/3RD YEAR - 1ST SEM/IPT/Programs"
```

### 2. Set Up the AI Model

First, create and run the custom ChefMate model using Ollama:

```bash
cd AI
ollama create chefmate -f ModelFile2
```

This will create a custom model based on Llama 3.2, fine-tuned specifically for culinary assistance.

### 3. Install Backend Dependencies

```bash
cd AI
pip install fastapi uvicorn pydantic
```

### 4. Install Frontend Dependencies

```bash
cd Frontend
npm install
```

## 🎯 Usage

### Starting the Backend Server

1. Navigate to the AI directory:
```bash
cd AI
```

2. Start the FastAPI server:
```bash
uvicorn server:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`

### Starting the Frontend

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal)

### Using KitchenMate

1. Open your browser and navigate to the frontend URL
2. Start a new chat or continue from your chat history
3. Ask questions about:
   - Recipes and cooking techniques
   - Ingredient substitutions
   - Kitchen tools and equipment
   - Menu planning
   - Any culinary-related topics

## 📁 Project Structure

```
Programs/
├── AI/
│   ├── server.py          # FastAPI backend server
│   ├── ModelFile          # Original model configuration
│   └── ModelFile2         # ChefMate model configuration
│
└── Frontend/
    ├── src/
    │   ├── Chat.jsx       # Main chat component
    │   ├── App.jsx        # Root component
    │   └── main.jsx       # Entry point
    ├── package.json       # Frontend dependencies
    └── vite.config.js     # Vite configuration
```

## 🎨 Features in Detail

### Chat Interface
- Clean, modern design with pink/rose color scheme
- Responsive layout that works on all devices
- Smooth animations and transitions

### Dark/Light Mode
- Toggle between themes via settings menu
- Theme preference saved in localStorage
- Consistent styling across all components

### Chat Management
- Automatic chat history saving
- Search functionality to find previous conversations
- Delete individual chats
- Smart title generation based on conversation content

## 🔧 API Endpoints

### POST `/api/ask`
Send a query to the AI model.

**Request Body:**
```json
{
  "prompt": "How do I make pasta?"
}
```

**Response:**
```json
{
  "response": "To make pasta, you'll need..."
}
```

## 🤖 AI Model Behavior

KitchenMate is specifically trained to:
- Provide detailed, structured cooking instructions
- Offer precise measurements and clear steps
- Suggest ingredient substitutions when needed
- Answer questions only about cooking, recipes, and kitchen-related topics
- Decline questions outside its culinary expertise with a polite message

## 👥 Contributors

This project was developed by:

- **Roince Jumao-as**
- **Ryan Jake Daz**
- **Joyce Mariane Dagsil**
- **Darwin Buising**

## 📝 License

This project is developed for educational purposes as part of the IPT (Information Processing Technology) course.

## 🐛 Troubleshooting

### Backend Issues
- Ensure Ollama is running: `ollama serve`
- Verify the model exists: `ollama list`
- Check if the model is created: `ollama show chefmate`

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if the backend is running on port 8000
- Verify CORS settings in `server.py`

### Model Issues
- Recreate the model if it's not working: `ollama create chefmate -f ModelFile2`
- Check Ollama logs for errors

## 🔮 Future Enhancements

- Voice input support
- Recipe image generation
- Meal planning calendar
- Shopping list generation
- Nutritional information
- Multi-language support

## 📞 Support

For issues or questions, please contact the development team.

---

**Note**: This project requires Ollama to be installed and running locally. The AI model runs on your machine, ensuring privacy and no external API calls.

