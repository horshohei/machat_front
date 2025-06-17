import { Suspense } from 'react';
import { RoomEntryForm } from '@/components/RoomEntryForm';

export default function HomePage() {

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
            <main className="text-center p-8 max-w-2xl">
                {/* --- ① ヒーローセクション --- */}
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                    複数人とAIが協力するチャットルーム
                </h1>
                <p className="text-lg text-gray-300 mb-8">
                    複数人と複数AIが協力・対話し、<br className="hidden md:inline"/>議論の広がりやAIのファシリテーション効果を<br className="hidden md:inline"/>体験・検証しませんか         </p>
                {/* ★ ここからが修正箇所 ★ */}
                <Suspense fallback={<LoadingSpinner />}>
                    <RoomEntryForm />
                </Suspense>
                {/* ★ ここまでが修正箇所 ★ */}
                <div className="mt-16 w-full p-4 border border-gray-700 rounded-lg bg-black bg-opacity-30 shadow-2xl">
                    <h2 className="text-lg font-bold mb-2 text-blue-200">🧪 実験用シナリオ例</h2>
                    <ul className="text-left text-sm text-blue-100 space-y-1">
                        <li>・うどんつゆ「関西風vs関東風」論争</li>
                        <li>・文化祭の飲食マニュアル作成ディスカッション</li>
                        <li>など、複数AI＋人間による議論の流れをすぐに体験できるでしょう。</li>
                    </ul>
                </div>

                {/* --- ② 特徴紹介セクション (ヒーローセクションの下に配置) --- */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="text-left">
                        <h3 className="text-xl font-bold mb-2">🤖 AIファシリテーター</h3>
                        <p className="text-gray-400">議論が停滞したり、脱線したりすると、AIが介入し、会話の流れをスムーズにします。</p>
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

// Suspense の fallback に表示するローディングコンポーネント
const LoadingSpinner = () => {
    return (
        <div className="w-full max-w-lg mx-auto h-[188px] flex items-center justify-center"> {/* 高さをフォームに合わせて調整 */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );
};