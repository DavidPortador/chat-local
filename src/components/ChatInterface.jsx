import { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Send, RefreshCw } from "lucide-react";

const ChatInterface = () => {
  const env = import.meta.env;
  const chatUrl = env.PUBLIC_CHAT_API_URL;
  const modelsUrl = env.PUBLIC_MODELS_API_URL;
  const defaultModel = env.PUBLIC_MODEL_NAME;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelName, setModelName] = useState(defaultModel);
  const [modelOptions, setModelOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Add AI response to chat
      const newAiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const fetchModels = async () => {
    if (showOptions){
      setShowOptions(false);
    } else {
      try {
        const response = await fetch(modelsUrl, {
          method: 'GET'
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setModelOptions(data.models.map(model => model.name));
          setShowOptions(true);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
  };

  const selectModel = (model) => {
    setModelName(model);
    setShowOptions(false);
  };

  return (
    <>
      <main className="flex-1 min-h-0 container mx-auto p-4 flex">
        {/* Chat Container */}
        <div className="flex-1 min-h-0 bg-gray-800 rounded-lg shadow-2xl flex flex-col">
          {/* Messages Display Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Send a message to start chatting with {modelName}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 rounded-lg max-w-3xl mx-auto ${
                    message.role === 'user' 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="p-4 rounded-lg max-w-3xl mx-auto bg-gray-800 text-white">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-1 animate-bounce"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4 bg-gray-800">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <button
                type="button"
                onClick={fetchModels}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-2 transition duration-200 flex items-center"
                title="Refresh model list"
              >
                <RefreshCw size={16} />
              </button>
              <input
                type="text"
                name = "input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-grow border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                autoComplete="off"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-lg transition duration-200 flex items-center disabled:opacity-50"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send/>
              </button>
            </form>
            
            {/* Model Options Dropdown */}
            {showOptions && (
              <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-1">Select a model:</h3>
                <div className="flex flex-wrap gap-1">
                  {modelOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => selectModel(option)}
                      className={`px-2 py-1 text-xs rounded ${
                        modelName === option 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatInterface;