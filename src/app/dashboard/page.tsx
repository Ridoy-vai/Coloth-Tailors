"use client";

import { useState, useEffect } from "react";

type ChatSummary = {
    _id: string;
    sessionId: string;
    messageCount: number;
    lastMessage: string;
    lastRole: string;
    updatedAt: string;
};

type Message = {
    role: "user" | "assistant";
    content: string;
};
const sessionId = "20050f78-0792-4ce9-a24f-1ed14dd9847a"

export default function AssistantChatsDashboard() {
    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [loadingConversation, setLoadingConversation] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assistant/history`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    setError(data.message || "Failed to load chats.");
                    return;
                }
                setChats(data.result || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load chats.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const openConversation = async (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setLoadingConversation(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assistant/history/${sessionId}`);
            const data = await res.json();
            setConversation(data.messages || []);
        } catch (err) {
            console.error(err);
            setConversation([]);
        } finally {
            setLoadingConversation(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">AI Assistant Chats</h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sessions list */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700">
                            {loading ? "Loading..." : `${chats.length} conversations`}
                        </p>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-6 text-center text-sm text-gray-400">Loading chats...</div>
                        ) : error ? (
                            <div className="p-6 text-center text-sm text-red-500">{error}</div>
                        ) : chats.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400">No conversations yet.</div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.sessionId}
                                    onClick={() => openConversation(chat.sessionId)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedSessionId === chat.sessionId ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-mono text-gray-400 truncate">
                                            {chat.sessionId.slice(0, 8)}...
                                        </p>
                                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                                            {chat.messageCount} msgs
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 truncate mt-1">
                                        {chat.lastRole === "user" ? "You: " : "Bot: "}
                                        {chat.lastMessage}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1">{formatDate(chat.updatedAt)}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Conversation view */}
                <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700">
                            {selectedSessionId ? `Session: ${selectedSessionId.slice(0, 8)}...` : "Select a conversation"}
                        </p>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
                        {!selectedSessionId ? (
                            <div className="text-center text-sm text-gray-400 py-16">
                                Click on a conversation from the left to view it here.
                            </div>
                        ) : loadingConversation ? (
                            <div className="text-center text-sm text-gray-400 py-16">Loading conversation...</div>
                        ) : conversation.length === 0 ? (
                            <div className="text-center text-sm text-gray-400 py-16">No messages found.</div>
                        ) : (
                            conversation.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}