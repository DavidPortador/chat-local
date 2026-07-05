import { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Send } from "lucide-react";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const env = import.meta.env;
  const apiUrl = env.PUBLIC_CHAT_API_URL;
  const modelName = env.PUBLIC_MODEL_NAME;

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
      const response = await fetch(apiUrl, {
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

  return (
    <>
      <main className="flex-1 min-h-0 container mx-auto p-4 flex">
        {/* Chat Container */}
        <div className="flex-1 min-h-0 bg-gray-800 rounded-lg shadow-2xl flex flex-col">
          {/* Messages Display Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Send a message to start chatting with the local AI model</p>
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center disabled:opacity-50"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send/>
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatInterface;