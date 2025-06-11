// components/MessageInput.tsx
'use client';

import { useState, FormEvent, KeyboardEvent, ChangeEvent, useRef, useEffect } from 'react';

interface MessageInputProps {
    onSend: (message: string) => void;
    isConnected: boolean;
}

export const MessageInput = ({ onSend, isConnected }: MessageInputProps) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // テキストエリアの高さを内容に応じて自動調整する
    const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        // 高さを一度リセットしてから、スクロールハイトに合わせて再設定
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        // Shift + Enter が押されたらメッセージを送信
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault(); // デフォルトの改行動作をキャンセル
            sendMessage();
        }
        // Enter のみの場合はデフォルトの改行動作に任せる
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault(); // フォーム送信によるページリロードを防止
        sendMessage();
    };

    const sendMessage = () => {
        if (input.trim() && isConnected) {
            onSend(input);
            setInput(''); // 送信後にテキストエリアをクリア
        }
    };

    // 送信後にテキストエリアの高さをリセット
    useEffect(() => {
        if (!input && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [input]);

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
            <div className="flex items-start bg-white border border-gray-300 rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
        <textarea
            ref={textareaRef}
            className="flex-1 px-2 py-2 border-none focus:ring-0 resize-none bg-transparent overflow-y-hidden"
            placeholder="メッセージを入力... (Shift+Enterで送信)"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            rows={1} // 初期表示の行数
            style={{ maxHeight: '150px' }} // 高くなりすぎないように最大値を設定
        />
                <button
                    type="submit"
                    className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg self-end hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected || !input.trim()}
                >
                    送信
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right pr-1">Shift + Enter で送信</p>
        </form>
    );
};