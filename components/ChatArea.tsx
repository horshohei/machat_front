// components/ChatArea.tsx
'use client';

import { useChatStore } from '@/store/chatStore';
import { Message } from './Message';
import { useEffect, useRef } from 'react';

export const ChatArea = () => {
    const messages = useChatStore((state) => state.messages);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    return (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50"> {/* 背景を薄いグレーに */}
            {messages.map((msg, index) => (
                // MessageコンポーネントはストアからmyTokenを取得するため、propsは不要に
                <Message key={index} message={msg} />
            ))}
            <div ref={chatEndRef} />
        </div>
    );
};