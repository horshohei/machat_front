// app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState(''); // ★ ユーザー名の状態を追加
    const router = useRouter();

    const handleJoinRoom = (e: FormEvent) => {
        e.preventDefault();
        if (roomName.trim() && username.trim()) {
            // URLにルーム名とユーザー名を付与して遷移
            const encodedRoomName = encodeURIComponent(roomName.trim());
            const encodedUsername = encodeURIComponent(username.trim());
            router.push(`/chat/${encodedRoomName}?username=${encodedUsername}`); // ★ クエリパラメータを追加
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
            <main className="text-center p-8 max-w-2xl">
                {/* --- ① ヒーローセクション --- */}
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                    AIはあなたを助けてくれますか？
                </h1>
                <p className="text-lg text-gray-300 mb-8">
                    複数人と複数AIが協力・対話し、<br className="hidden md:inline"/>議論の広がりやAIのファシリテーション効果を<br className="hidden md:inline"/>体験・検証できますか？                </p>
                <form onSubmit={handleJoinRoom} className="flex flex-col gap-4 w-full max-w-lg mx-auto">
                    {/* ★ ユーザー名入力欄を追加 */}
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="あなたの表示名を入力..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
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

                <div className="mt-16 w-full p-4 border border-gray-700 rounded-lg bg-black bg-opacity-30 shadow-2xl">
                    <h2 className="text-lg font-bold mb-2 text-blue-200">🧪 実験用シナリオ例</h2>
                    <ul className="text-left text-sm text-blue-100 space-y-1">
                        <li>・うどんつゆ「関西風vs関東風」論争</li>
                        <li>・文化祭の飲食マニュアル作成ディスカッション</li>
                        <li>など、複数AI＋人間による議論の流れをすぐに体験できますか？</li>
                    </ul>
                </div>

                {/* --- ② 特徴紹介セクション (ヒーローセクションの下に配置) --- */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-left">
                        <h3 className="text-xl font-bold mb-2">🤖 AIファシリテーター</h3>
                        <p className="text-gray-400">議論が停滞したり、脱線したりすると、AIが自然に介入し、会話の流れをスムーズにします。</p>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold mb-2">👥 AI参加者</h3>
                        <p className="text-gray-400">専門家やアイデアマンとしてAIをチャットに参加させ、議論に新しい視点をもたらします。</p>
                    </div>
                </div>

            </main>
        </div>
    );
}