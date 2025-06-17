// app/chat/[room_id]/page.tsx
'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { MessageInput } from '@/components/MessageInput';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useChatStore } from '@/store/chatStore';
import { useParams, useSearchParams } from 'next/navigation';// ★ useParams をインポート
import { useEffect, useState } from 'react'; // ★ useEffect, useState をインポート

// props ({ params }: ChatPageProps) は受け取らない形に変更します
export default function ChatPage() {
    const params = useParams(); // ★ useParams フックでパラメータを取得
    const searchParams = useSearchParams();
    const [roomId, setRoomId] = useState<string | null>(null); // ★ roomId を state で管理
    const [inputUsername, setinputUsername] = useState<string | null>(null); // ★ username を state で管理


    // ★ useEffect を使って、params が利用可能になったら roomId をセット
    useEffect(() => {
        // params は { room_id: '...' } のようなオブジェクトを返します。
        // 値が存在し、かつ文字列であることを確認します。
        if (params && typeof params.room_id === 'string') {
            const decodedRoomId = decodeURIComponent(params.room_id); // ★ ここでデコード
            setRoomId(decodedRoomId);
            console.log("Room ID set:", decodedRoomId);
            setinputUsername(searchParams.get('username')); // URLのクエリパラメータからusernameを取得
            // ★ ここで確認
        }
        if (params && typeof params.username === 'string') {
            setinputUsername(params.username);
            console.log("Username set:", params.username); // ★ ここで確認
        }
    }, [params]); // params が変更されたら再実行

    // ★ roomId が確定するまで useChatWebSocket を呼ばない（または空文字を渡す）
    //    useChatWebSocket フック側で roomId が空なら何もしないように修正済みです。
    const { sendMessage, error } = useChatWebSocket(roomId || '', inputUsername || '');
    const { isConnected } = useChatStore();

    // ★ roomId がまだセットされていない場合はローディング表示などを出す
    if (!roomId) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold">チャットルームを読み込んでいます...</div>
            </div>
        );
    }

    // roomId が確定した後のレンダリング
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <header className="pt-4 pl-7 pb-1 bg-white border-b shadow-sm">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        チャットルーム: {roomId} {/* ★ state の roomId を使用 */}
                        <span className={`ml-3 text-sm font-normal px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isConnected ? '接続中' : '切断'}
                </span>
                    </h1>
                    {error && <p className="text-red-600 mt-1">{error}</p>}
                </header>
                <ChatArea />
                <MessageInput onSend={sendMessage} isConnected={isConnected} />
            </div>
        </div>
    );
}