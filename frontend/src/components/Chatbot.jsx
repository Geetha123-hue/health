import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { api } from '../services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I am your UrbanHealth AI assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setIsTyping(true);

        try {
            const lang = localStorage.getItem('lang') || 'English';
            const response = await api.chat.sendMessage(userMsg, lang);

            setMessages(prev => [...prev, { text: response.reply, isBot: true }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting to my servers.", isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chat-header">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <span>UrbanHealth Support</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`msg ${msg.isBot ? 'msg-bot' : 'msg-user'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="msg msg-bot" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                AI is typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="chat-send-btn" disabled={!input.trim() || isTyping}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
