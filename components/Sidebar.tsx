// components/Sidebar.tsx
'use client';

import { useChatStore, User } from '@/store/chatStore';
import { useParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

// ユーザータイプを判別するヘルパー関数
const getUserType = (user: User, myToken: string | null): string => {
    if (user.id === myToken) return 'me';
    if (user.id === 'AIAssistantFacilitator') return 'facilitator';
    if (user.id.startsWith('AIAssistant_')) return 'ai_participant';
    return 'other';
};

const UserDisplay = ({ user, myToken }: { user: User; myToken: string | null }) => {
    const type = getUserType(user, myToken);
    let icon = '👤';
    let textColor = 'text-white';
    let nameSuffix = '';

    switch (type) {
        case 'me':
            icon = '🧑‍💻';
            nameSuffix = ' (自分)';
            textColor = 'text-yellow-400'; // 自分の色
            break;
        case 'facilitator':
            icon = '👑'; // ファシリテーターのアイコン
            textColor = 'text-purple-400'; // ファシリテーターの色
            break;
        case 'ai_participant':
            icon = '🤖';
            textColor = 'text-cyan-400'; // AI参加者の色
            break;
        default: // 'other'
            icon = '👤';
            break;
    }

    return (
        <div className="flex items-center space-x-2">
            <span className={`${type === 'me' || type === 'facilitator' || type === 'ai_participant' ? 'w-3 h-3 bg-green-500 rounded-full' : 'w-3 h-3 bg-gray-400 rounded-full'}`}></span>
            <span className={`truncate ${textColor}`} title={user.id}>
        {icon} {user.name}{nameSuffix}
      </span>
        </div>
    );
};


export const Sidebar = () => {
    const { users, myToken, facilitatorEnabled, setFacilitatorStatus, activeAiParticipants, addAiParticipantStore, removeAiParticipantStore, setActiveAiParticipants } = useChatStore();
    const params = useParams();
    const roomId = typeof params.room_id === 'string' ? params.room_id : null;

    const [newAiName, setNewAiName] = useState('');
    const [isLoadingFacilitator, setIsLoadingFacilitator] = useState(false);
    const [isLoadingAddAi, setIsLoadingAddAi] = useState(false);
    const [isLoadingRemoveAi, setIsLoadingRemoveAi] = useState<string | null>(null); // 削除中のAI名

    const handleToggleFacilitator = async () => {
        if (!roomId) return;
        setIsLoadingFacilitator(true);
        try {
            const response = await fetch(`/api/room/${roomId}/facilitator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enable: !facilitatorEnabled }),
            });
            if (response.ok) {
                const data = await response.json();
                setFacilitatorStatus(data.facilitator_enabled);
            } else {
                console.error('Failed to toggle facilitator status');
                // エラー通知をユーザーに表示する処理
            }
        } catch (error) {
            console.error('Error toggling facilitator:', error);
        } finally {
            setIsLoadingFacilitator(false);
        }
    };

    const handleAddAiParticipant = async (e: FormEvent) => {
        e.preventDefault();
        if (!roomId || !newAiName.trim()) return;
        setIsLoadingAddAi(true);
        try {
            const response = await fetch(`/api/room/${roomId}/ai_participant/${encodeURIComponent(newAiName.trim())}`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                // ストアを即時更新 (サーバーからのWebSocketメッセージでの更新も期待するが、UI反応を良くするため)
                if(data.ai_participant_added){
                    addAiParticipantStore(data.ai_participant_added);
                }
                // setActiveAiParticipants(data.active_ais || []); // FastAPIが返すリストで更新してもよい
                setNewAiName('');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to add AI participant:', errorData.error || response.statusText);
                // エラー通知
            }
        } catch (error) {
            console.error('Error adding AI participant:', error);
        } finally {
            setIsLoadingAddAi(false);
        }
    };

    const handleRemoveAiParticipant = async (aiName: string) => {
        if (!roomId) return;
        setIsLoadingRemoveAi(aiName);
        try {
            const response = await fetch(`/api/room/${roomId}/ai_participant/${encodeURIComponent(aiName)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const data = await response.json();
                // ストアを即時更新
                if(data.ai_participant_removed){
                    removeAiParticipantStore(data.ai_participant_removed);
                }
                // setActiveAiParticipants(data.active_ais || []);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to remove AI participant:', errorData.error || response.statusText);
                // エラー通知
            }
        } catch (error) {
            console.error('Error removing AI participant:', error);
        } finally {
            setIsLoadingRemoveAi(null);
        }
    };


    return (
        <aside className="w-72 bg-gray-800 text-white p-6 flex flex-col space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-4">参加者</h2>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <li key={user.id}>
                                <UserDisplay user={user} myToken={myToken} />
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-400">参加者はいません。</li>
                    )}
                </ul>
            </div>

            <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-3">AI設定</h3>
                {/* ファシリテーター制御 */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">AIファシリテーター</span>
                    <button
                        onClick={handleToggleFacilitator}
                        disabled={isLoadingFacilitator}
                        className={`px-3 py-1 text-xs rounded-md ${
                            facilitatorEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        } disabled:opacity-50`}
                    >
                        {isLoadingFacilitator ? '処理中...' : facilitatorEnabled ? 'OFFにする' : 'ONにする'}
                    </button>
                </div>

                {/* AI参加者追加 */}
                <form onSubmit={handleAddAiParticipant} className="space-y-2 mb-4">
                    <label htmlFor="aiName" className="block text-sm font-medium">AI参加者追加:</label>
                    <div className="flex space-x-2">
                        <input
                            id="aiName"
                            type="text"
                            value={newAiName}
                            onChange={(e) => setNewAiName(e.target.value)}
                            placeholder="AI名を入力"
                            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoadingAddAi || !newAiName.trim()}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm disabled:opacity-50"
                        >
                            {isLoadingAddAi ? '追加中...' : '追加'}
                        </button>
                    </div>
                </form>

                {/* AI参加者リストと削除 */}
                {activeAiParticipants.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">アクティブなAI参加者:</h4>
                        <ul className="space-y-1 text-sm">
                            {activeAiParticipants.map((aiName) => (
                                <li key={aiName} className="flex justify-between items-center bg-gray-700 px-2 py-1 rounded">
                                    <span className="truncate text-cyan-400">🤖 {aiName}</span>
                                    <button
                                        onClick={() => handleRemoveAiParticipant(aiName)}
                                        disabled={isLoadingRemoveAi === aiName}
                                        className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                                    >
                                        {isLoadingRemoveAi === aiName ? '削除中...' : '削除'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </aside>
    );
};