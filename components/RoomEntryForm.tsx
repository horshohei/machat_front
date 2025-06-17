// components/RoomEntryForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const RoomEntryForm = () => {
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    // コンポーネントがマウントされた後にクエリパラメータから初期値を設定
    useEffect(() => {
        const prefilledRoomName = searchParams.get('roomName');
        if (prefilledRoomName) {
            setRoomName(decodeURIComponent(prefilledRoomName));
        }

        const prefilledUsername = searchParams.get('username');
        if (prefilledUsername) {
            setUsername(decodeURIComponent(prefilledUsername));
        }
    }, [searchParams]);

    const handleJoinRoom = (e: FormEvent) => {
        e.preventDefault();
        if (roomName.trim() && username.trim()) {
            const encodedRoomName = encodeURIComponent(roomName.trim());
            const encodedUsername = encodeURIComponent(username.trim());
            router.push(`/chat/${encodedRoomName}?username=${encodedUsername}`);
        }
    };

    return (
        <form onSubmit={handleJoinRoom} className="flex flex-col gap-4 w-full max-w-lg mx-auto">
            {/* ★ ユーザー名入力欄を追加 */}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="あなたの表示名を入力..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="チャットルーム名を入力..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
            />
            <button
                type="submit"
                className="w-full px-8 py-3 bg-blue-600 font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition disabled:opacity-50"
                disabled={!roomName.trim() || !username.trim()}
            >
                ルームを作成 / 参加
            </button>
        </form>
    );
};