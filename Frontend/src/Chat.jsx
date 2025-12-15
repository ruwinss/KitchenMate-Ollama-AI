import { useState, useEffect, useRef } from 'react'

// LocalStorage keys
const STORAGE_KEY = 'kitchen_chat_history'
const THEME_KEY = 'kitchenmate_theme'

// Helper functions for LocalStorage
const getChatHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading chat history:', error)
    return []
  }
}

const saveChatHistory = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch (error) {
    console.error('Error saving chat history:', error)
  }
}

const generateChatTitle = (messages) => {
  if (!messages || messages.length === 0) {
    return 'New Chat'
  }

  // Get all user messages to analyze
  const userMessages = messages.filter(msg => msg.role === 'user')
  if (userMessages.length === 0) {
    return 'New Chat'
  }

  const firstMessage = userMessages[0].content.trim()
  const allText = userMessages.map(msg => msg.content.toLowerCase()).join(' ')

  // Helper function to capitalize words
  const capitalizeWords = (text) => {
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ').trim()
  }

  // Helper function to clean and format title
  const formatTitle = (text, maxLength = 50) => {
    let cleaned = text.replace(/\s+/g, ' ').replace(/[?.,!;:]/g, '').trim()
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength).trim()
      // Don't cut words in the middle if possible
      const lastSpace = cleaned.lastIndexOf(' ')
      if (lastSpace > maxLength * 0.7) {
        cleaned = cleaned.substring(0, lastSpace)
      }
      cleaned += '...'
    }
    return capitalizeWords(cleaned)
  }

  // Pattern 1: Recipe requests - "recipe for [dish]", "how to make [dish]", etc.
  const recipePatterns = [
    /(?:recipe|make|cook|prepare|create)\s+(?:for|of|a|an|the)?\s+([a-z\s]+?)(?:\s+recipe|\s+how|\s+with|\?|$)/i,
    /([a-z\s]+?)\s+recipe/i,
    /how\s+to\s+(?:make|cook|prepare|create|bake|roast|grill|fry|steam)\s+([a-z\s]+?)(?:\s+with|\s+using|\?|$)/i,
    /(?:i\s+want\s+to|i\s+need\s+to|show\s+me\s+how\s+to)\s+(?:make|cook|prepare)\s+([a-z\s]+?)(?:\?|$)/i,
    /(?:give\s+me|tell\s+me|show\s+me)\s+(?:a|the)?\s+recipe\s+(?:for|of)\s+([a-z\s]+?)(?:\?|$)/i
  ]

  for (const pattern of recipePatterns) {
    const match = firstMessage.match(pattern)
    if (match && match[1]) {
      const dishName = match[1].trim()
      if (dishName.length > 2 && dishName.length < 40) {
        return formatTitle(`${dishName} Recipe`, 45)
      }
    }
  }

  // Pattern 2: Ingredient questions
  const ingredientPatterns = [
    /(?:what|tell\s+me\s+about|explain|describe)\s+(?:is|are|do\s+you\s+know\s+about)\s+([a-z\s]+?)(?:\?|$)/i,
    /(?:substitute|substitution|alternative|replace)\s+(?:for|of)?\s+([a-z\s]+?)(?:\?|$)/i,
    /(?:can\s+i\s+use|what\s+can\s+i\s+use)\s+instead\s+of\s+([a-z\s]+?)(?:\?|$)/i
  ]

  for (const pattern of ingredientPatterns) {
    const match = firstMessage.match(pattern)
    if (match && match[1]) {
      const ingredient = match[1].trim()
      if (ingredient.length > 2 && ingredient.length < 40) {
        return formatTitle(`About ${ingredient}`, 45)
      }
    }
  }

  // Pattern 3: Technique questions
  const techniquePatterns = [
    /(?:how\s+do\s+i|how\s+to|how\s+can\s+i)\s+(?:properly|correctly)?\s+(?:cook|prepare|make|bake|roast|grill|fry|steam|boil|saute|braise|poach)\s+([a-z\s]+?)(?:\?|$)/i,
    /(?:what\s+is|explain|tell\s+me\s+about)\s+(?:the\s+)?(?:technique|method|way)\s+(?:of|for)?\s+([a-z\s]+?)(?:\?|$)/i,
    /(?:best\s+way|proper\s+way|correct\s+way)\s+to\s+(?:cook|prepare|make)\s+([a-z\s]+?)(?:\?|$)/i
  ]

  for (const pattern of techniquePatterns) {
    const match = firstMessage.match(pattern)
    if (match && match[1]) {
      const technique = match[1].trim()
      if (technique.length > 2 && technique.length < 40) {
        return formatTitle(`Cooking ${technique}`, 45)
      }
    }
  }

  // Pattern 4: Kitchen tools/equipment
  const toolPatterns = [
    /(?:what|which|tell\s+me\s+about)\s+(?:is|are|do\s+i\s+need)\s+(?:a|an|the)?\s+([a-z\s]+?)(?:\s+for|\s+used|\?|$)/i,
    /(?:how\s+to\s+use|how\s+do\s+i\s+use)\s+(?:a|an|the)?\s+([a-z\s]+?)(?:\?|$)/i
  ]

  for (const pattern of toolPatterns) {
    const match = firstMessage.match(pattern)
    if (match && match[1]) {
      const tool = match[1].trim()
      if (tool.length > 2 && tool.length < 40) {
        return formatTitle(`About ${tool}`, 45)
      }
    }
  }

  // Pattern 5: Menu planning
  if (allText.match(/(?:menu|meal\s+plan|plan\s+meals|weekly\s+menu|meal\s+prep)/i)) {
    return formatTitle('Menu Planning', 45)
  }

  // Pattern 6: Extract capitalized words (likely dish/ingredient names)
  const capitalizedWords = firstMessage.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g)
  if (capitalizedWords && capitalizedWords.length > 0) {
    const potentialName = capitalizedWords.find(phrase => phrase.length >= 3 && phrase.length < 35)
    if (potentialName) {
      // Check if it's a recipe-related query
      if (allText.match(/(?:recipe|make|cook|prepare|how\s+to)/i)) {
        return formatTitle(`${potentialName} Recipe`, 45)
      }
      return formatTitle(potentialName, 50)
    }
  }

  // Pattern 7: Remove question words and extract meaningful content
  if (firstMessage.includes('?')) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'did', 'will', 'tell', 'me', 'about', 'explain', 'show']
    const words = firstMessage.replace(/[?.,!;:]/g, '').split(/\s+/)
    const filteredWords = words.filter(word => {
      const lower = word.toLowerCase()
      return !questionWords.includes(lower) && 
             word.length > 2 && 
             !['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'from', 'to', 'of', 'in', 'on', 'at'].includes(lower)
    })
    
    if (filteredWords.length > 0) {
      const title = filteredWords.slice(0, 6).join(' ')
      return formatTitle(title, 50)
    }
  }

  // Pattern 8: Extract key nouns and verbs (last resort)
  const importantWords = firstMessage
    .replace(/[?.,!;:]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5)
  
  if (importantWords.length > 0) {
    return formatTitle(importantWords.join(' '), 50)
  }

  // Final fallback: use first meaningful part of message
  const fallback = firstMessage.replace(/[?.,!;:]/g, '').trim()
  return formatTitle(fallback.substring(0, 50), 50)
}

const formatDate = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInMs = now - date
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem(THEME_KEY)
    return savedTheme || 'light'
  })
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Close settings menu and plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest('.settings-menu-container')) {
        setShowSettingsMenu(false)
      }
      if (showPlusMenu && !event.target.closest('.plus-menu-container')) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettingsMenu, showPlusMenu])

  // Load chat history on mount
  useEffect(() => {
    const history = getChatHistory()
    setChatHistory(history)
  }, [])

  // Handle Ctrl+U keyboard shortcut for file upload
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        fileInputRef.current?.click()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
    setShowPlusMenu(false)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
    setShowSettingsMenu(false)
  }

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(prev => !prev)
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev)
  }

  const toggleSearch = () => {
    setIsSearchActive(prev => !prev)
    if (isSearchActive) {
      setSearchQuery('') // Clear search when closing
    }
  }

  const togglePlusMenu = () => {
    setShowPlusMenu(prev => !prev)
  }

  // Render the plus menu dropdown
  const renderPlusMenu = () => {
    if (!showPlusMenu) return null
    
    return (
      <div className={`absolute bottom-full left-0 mb-2 w-64 rounded-lg shadow-lg border z-50 ${
        theme === 'dark'
          ? 'bg-gray-800 border-pink-900/60'
          : 'bg-white border-pink-200/60'
      }`}>
        <div className="py-1">
          {/* Add photos & files */}
          <button
            onClick={handleFileUpload}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-pink-100'
                : 'hover:bg-pink-50 text-pink-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.586-6.586a4 4 0 00-5.656 5.656l6.586 6.586a4 4 0 005.656-5.656l-1.172-1.172z" />
              </svg>
              <span>Add photos & files</span>
            </div>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-pink-400' : 'text-gray-500'
            }`}>Ctrl + U</span>
          </button>
        </div>
      </div>
    )
  }

  // Filter chat history based on search query
  const filteredChatHistory = searchQuery.trim()
    ? chatHistory.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.messages && chat.messages.some(msg => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : chatHistory

  // Save current chat to history when messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const history = getChatHistory()
      const updatedHistory = history.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages, title: generateChatTitle(messages), updatedAt: Date.now() }
          : chat
      )
      saveChatHistory(updatedHistory)
      setChatHistory(updatedHistory)
    }
  }, [messages, currentChatId])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    // Create new chat if this is the first message
    let chatId = currentChatId
    if (!chatId) {
      chatId = Date.now().toString()
      setCurrentChatId(chatId)
      const newChat = {
        id: chatId,
        title: generateChatTitle([{ role: 'user', content: trimmed }]),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const history = getChatHistory()
      const updatedHistory = [newChat, ...history]
      saveChatHistory(updatedHistory)
      setChatHistory(updatedHistory)
      setSelectedChat(chatId)
    }

    const userMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSelectedFiles([]) // Clear selected files after sending
    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmed }),
      })

      if (!res.ok) {
        throw new Error('Failed to reach backend')
      }

      const data = await res.json()
      const aiText = data.response || 'No response from model.'

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiText },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error talking to AI: ' + err.message,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      const history = getChatHistory()
      const updatedHistory = history.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages, title: generateChatTitle(messages), updatedAt: Date.now() }
          : chat
      )
      saveChatHistory(updatedHistory)
      setChatHistory(updatedHistory)
    }

    // Clear current chat
    setMessages([])
    setSelectedChat(null)
    setCurrentChatId(null)
  }

  const handleSelectChat = (chatId) => {
    const history = getChatHistory()
    const chat = history.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages || [])
      setSelectedChat(chatId)
      setCurrentChatId(chatId)
    }
  }

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation() // Prevent triggering chat selection
    
    const history = getChatHistory()
    const updatedHistory = history.filter(chat => chat.id !== chatId)
    saveChatHistory(updatedHistory)
    setChatHistory(updatedHistory)
    
    // If the deleted chat was selected, clear the current chat
    if (selectedChat === chatId || currentChatId === chatId) {
      setMessages([])
      setSelectedChat(null)
      setCurrentChatId(null)
    }
  }

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' 
        ? 'bg-[radial-gradient(circle_at_top,#1a0a1a_0,#2d0f2d_25%,#3d1a3d_60%,#4a1f4a_100%)]' 
        : 'bg-[radial-gradient(circle_at_top,#ffe4f5_0,#ffd1ec_25%,#f8b4e6_60%,#f472b6_100%)]'
    }`}>
      {/* Left Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'} flex flex-col h-screen transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/95 border-r border-pink-900/60' 
          : 'bg-white/95 border-r border-pink-200/60'
      }`}>
        {/* Logo Section */}
        <div className={`p-4 border-b transition-colors ${
          theme === 'dark' ? 'border-pink-900/60' : 'border-pink-200/60'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white overflow-hidden">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Chef's Hat */}
                <path d="M12 4C10.5 4 9 5 9 6.5V8H15V6.5C15 5 13.5 4 12 4Z" fill="currentColor" opacity="0.9"/>
                <path d="M8 8H16V9C16 10.5 14.5 12 12 12C9.5 12 8 10.5 8 9V8Z" fill="currentColor"/>
                {/* Cooking Pot */}
                <path d="M10 13H14C14.5 13 15 13.5 15 14V16C15 16.5 14.5 17 14 17H10C9.5 17 9 16.5 9 16V14C9 13.5 9.5 13 10 13Z" fill="currentColor"/>
                <path d="M11 17H13V19H11V17Z" fill="currentColor"/>
                {/* Steam */}
                <circle cx="10" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                <circle cx="14" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                <circle cx="12" cy="10" r="0.6" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <span className={`text-lg font-semibold transition-colors ${
              theme === 'dark' ? 'text-pink-100' : 'text-pink-900'
            }`}>KitchenMate</span>
          </div>
        </div>

        {/* Navigation */}
        <div className={`p-2 border-b transition-colors ${
          theme === 'dark' ? 'border-pink-900/60' : 'border-pink-200/60'
        }`}>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-pink-100' 
                : 'hover:bg-pink-50/70 text-pink-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            New chat
          </button>
          {isSearchActive ? (
            <div className="mt-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                autoFocus
                className={`w-full px-3 py-2 pl-9 pr-9 rounded-lg text-sm outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-pink-100 placeholder:text-pink-400 border border-pink-900/60 focus:border-pink-700'
                    : 'bg-pink-50/70 text-pink-900 placeholder:text-pink-500 border border-pink-200/60 focus:border-pink-400'
                }`}
              />
              <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={toggleSearch}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-pink-300'
                    : 'hover:bg-pink-100 text-pink-600'
                }`}
                title="Close search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={toggleSearch}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-1 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 text-pink-100' 
                  : 'hover:bg-pink-50/70 text-pink-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search chats
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className={`px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            theme === 'dark' ? 'text-pink-300' : 'text-pink-700'
          }`}>
            Your chats
          </div>
          <div className="space-y-1">
            {filteredChatHistory.length === 0 ? (
              <div className={`px-3 py-2 text-sm italic transition-colors ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
              }`}>
                {searchQuery.trim() ? 'No chats found' : 'No chat history yet'}
              </div>
            ) : (
              filteredChatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedChat === chat.id
                      ? theme === 'dark'
                        ? 'bg-pink-900/50'
                        : 'bg-pink-100'
                      : theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-pink-50/70'
                  }`}
                >
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full text-left"
                  >
                    <div className={`truncate pr-6 transition-colors ${
                      selectedChat === chat.id
                        ? theme === 'dark'
                          ? 'text-pink-100 font-medium'
                          : 'text-pink-900 font-medium'
                        : theme === 'dark'
                          ? 'text-pink-200'
                          : 'text-pink-800'
                    }`}>
                      {chat.title}
                    </div>
                    <div className={`text-xs mt-0.5 transition-colors ${
                      theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
                    }`}>
                      {formatDate(chat.updatedAt || chat.createdAt)}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-pink-300'
                        : 'hover:bg-pink-200 text-pink-600'
                    }`}
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className={`p-3 border-t transition-colors ${
          theme === 'dark' ? 'border-pink-900/60' : 'border-pink-200/60'
        }`}>
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-pink-50/70'
          }`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
              R
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate transition-colors ${
                theme === 'dark' ? 'text-pink-100' : 'text-pink-900'
              }`}>Roince</div>
              <div className={`text-xs transition-colors ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
              }`}>Free</div>
            </div>
            <button className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              theme === 'dark' 
                ? 'text-pink-200 bg-pink-900/50 hover:bg-pink-900/70' 
                : 'text-pink-700 bg-pink-100 hover:bg-pink-200'
            }`}>
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Bar */}
        <header className={`border-b px-4 py-3 flex items-center justify-between transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-900/95 border-pink-900/60' 
            : 'bg-white/95 border-pink-200/60'
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-pink-50/70'
              }`}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <svg className={`w-5 h-5 transition-colors ${
                  theme === 'dark' ? 'text-pink-300' : 'text-pink-700'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 transition-colors ${
                  theme === 'dark' ? 'text-pink-300' : 'text-pink-700'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-semibold transition-colors ${
                theme === 'dark' ? 'text-pink-100' : 'text-pink-900'
              }`}>KitchenMate</h1>
              
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative settings-menu-container">
              <button 
                onClick={toggleSettingsMenu}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-pink-50/70'
                } ${showSettingsMenu ? (theme === 'dark' ? 'bg-gray-800' : 'bg-pink-50/70') : ''}`}
                title="Settings"
              >
                <svg className={`w-5 h-5 transition-colors ${
                  theme === 'dark' ? 'text-pink-300' : 'text-pink-700'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {showSettingsMenu && (
                <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-pink-900/60'
                    : 'bg-white border-pink-200/60'
                }`}>
                  <div className="py-1">
                    {/* Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-pink-100'
                          : 'hover:bg-pink-50 text-pink-900'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    
                    {/* Divider */}
                    <div className={`my-1 border-t ${
                      theme === 'dark' ? 'border-pink-900/60' : 'border-pink-200/60'
                    }`}></div>
                    
                    {/* Profile */}
                    <button
                      onClick={() => setShowSettingsMenu(false)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-pink-100'
                          : 'hover:bg-pink-50 text-pink-900'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className={`flex-1 overflow-y-auto relative transition-colors ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-800'
            : 'bg-gradient-to-b from-pink-50 via-pink-50/80 to-pink-100'
        }`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-center mb-4">
                <h2 className={`text-2xl font-semibold transition-colors ${
                  theme === 'dark' ? 'text-pink-100' : 'text-pink-900'
                }`}>Ready when you are.</h2>
              </div>
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="w-full max-w-3xl mb-4">
                  <div className={`flex flex-wrap gap-2 p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800/70 border-pink-900/60'
                      : 'bg-pink-50/70 border-pink-200/60'
                  }`}>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-pink-100'
                            : 'bg-white text-pink-900'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className={`ml-1 p-0.5 rounded hover:opacity-70 transition-opacity ${
                            theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Centered Input Area */}
              <div className={`w-full max-w-3xl rounded-full border px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'border-pink-800/80 bg-gray-800/70'
                  : 'border-pink-300/80 bg-pink-50/70'
              }`}>
                <form onSubmit={handleSend} className="relative">
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 pr-12 outline-none transition text-lg ${
                          theme === 'dark'
                            ? 'bg-gray-800/70 text-pink-100 placeholder:text-pink-500'
                            : 'bg-pink-50/70 text-pink-950 placeholder:text-pink-400'
                        }`}
                        placeholder="Ask Anything"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 ${
                          theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                        } ${!input.trim() || loading ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Send message"
                      >
                        <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4C10.5 4 9 5 9 6.5V8H15V6.5C15 5 13.5 4 12 4Z" fill="currentColor" opacity="0.9"/>
                        <path d="M8 8H16V9C16 10.5 14.5 12 12 12C9.5 12 8 10.5 8 9V8Z" fill="currentColor"/>
                        <path d="M10 13H14C14.5 13 15 13.5 15 14V16C15 16.5 14.5 17 14 17H10C9.5 17 9 16.5 9 16V14C9 13.5 9.5 13 10 13Z" fill="currentColor"/>
                        <path d="M11 17H13V19H11V17Z" fill="currentColor"/>
                        <circle cx="10" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                        <circle cx="14" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                        <circle cx="12" cy="10" r="0.6" fill="currentColor" opacity="0.5"/>
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-800 border border-pink-900/80 text-pink-100 shadow-sm'
                          : 'bg-white border border-pink-200/80 text-pink-950 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                      theme === 'dark'
                        ? 'bg-pink-700 text-pink-100'
                        : 'bg-pink-300 text-pink-900'
                    }`}>
                      U
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4C10.5 4 9 5 9 6.5V8H15V6.5C15 5 13.5 4 12 4Z" fill="currentColor" opacity="0.9"/>
                      <path d="M8 8H16V9C16 10.5 14.5 12 12 12C9.5 12 8 10.5 8 9V8Z" fill="currentColor"/>
                      <path d="M10 13H14C14.5 13 15 13.5 15 14V16C15 16.5 14.5 17 14 17H10C9.5 17 9 16.5 9 16V14C9 13.5 9.5 13 10 13Z" fill="currentColor"/>
                      <path d="M11 17H13V19H11V17Z" fill="currentColor"/>
                      <circle cx="10" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                      <circle cx="14" cy="11" r="0.8" fill="currentColor" opacity="0.7"/>
                      <circle cx="12" cy="10" r="0.6" fill="currentColor" opacity="0.5"/>
                    </svg>
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm border shadow-sm italic opacity-90 transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-pink-900/80 text-pink-100'
                      : 'bg-white border-pink-200/80 text-pink-950'
                  }`}>
                    Thinking…
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Input Area - Only shown when there are messages */}
        {messages.length > 0 && (
          <div className={`border-t py-4 transition-colors ${
            theme === 'dark'
              ? 'bg-gray-900/95 border-pink-900/60'
              : 'bg-white/95 border-pink-200/60'
          }`}>
            <div className="flex items-center justify-center px-4">
              <div className="w-full max-w-3xl">
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <div className={`flex flex-wrap gap-2 p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 border-pink-900/60'
                        : 'bg-pink-50/70 border-pink-200/60'
                    }`}>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-pink-100'
                              : 'bg-white text-pink-900'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className={`ml-1 p-0.5 rounded hover:opacity-70 transition-opacity ${
                              theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <form onSubmit={handleSend} className="relative">
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className={`w-full rounded-full border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 transition ${
                          theme === 'dark'
                            ? 'border-pink-800/80 bg-gray-800/70 focus:border-pink-600 focus:ring-pink-900/70 text-pink-100 placeholder:text-pink-500'
                            : 'border-pink-300/80 bg-pink-50/70 focus:border-pink-500 focus:ring-pink-300/70 text-pink-950 placeholder:text-pink-400'
                        }`}
                        placeholder="Ask anything"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 ${
                          theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                        } ${!input.trim() || loading ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Send message"
                      >
                        <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat



