// store/chatStore.ts
import { create } from 'zustand';

export interface Message {
    type: 'chat' | 'join' | 'leave' | 'log' | 'error' | 'system_message' | 'config_update' | 'ai_thinking'; // ai_thinkingタイプを追加しても良い
    user_id: string;
    username?: string;
    message: string;
    timestamp: string;
    is_thinking?: boolean; // ★思考中メッセージかどうかのフラグ
    users?: User[];
    active_user?: User[];
    chat_log?: Omit<Message, 'users' | 'chat_log' | 'active_user'>[];
    facilitator_enabled?: boolean;
    active_ai_participants?: string[];
    // thinking_id?: string; // 置き換えや削除をするならID管理
}


// バックエンドから受け取るユーザー情報の型 (idとnameを含むように)
export interface User {
    id: string;
    name: string;
}

export interface ChatState {
    myToken: string | null;
    myUsername: string | null;
    messages: Message[];
    users: User[]; // User型に変更
    isConnected: boolean;
    facilitatorEnabled: boolean; // ★追加: ファシリテーターが有効か
    activeAiParticipants: string[]; // ★追加: アクティブなAI参加者の名前リスト (IDでも良い)

    setMyInfo: (token: string, username: string) => void;
    addMessage: (message: Message) => void;
    setUsers: (users: User[]) => void; // User型に変更
    setConnected: (status: boolean) => void;
    loadLogs: (logs: Message[]) => void;
    setFacilitatorStatus: (enabled: boolean) => void; // ★追加
    setActiveAiParticipants: (aiNames: string[]) => void; // ★追加
    addAiParticipantStore: (aiName: string) => void; // ★追加 (UIからの即時反映用)
    removeAiParticipantStore: (aiName: string) => void; // ★追加 (UIからの即時反映用)
    processAiResponseMessage: (aiResponseMessage: Message) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    myToken: null,
    myUsername: null,
    messages: [],
    users: [],
    isConnected: false,
    facilitatorEnabled: false, // ★初期値
    activeAiParticipants: [], // ★初期値

    setMyInfo: (token, username) => set({ myToken: token, myUsername: username }),
    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    setUsers: (users) => set({ users }),
    setConnected: (status) => set({ isConnected: status }),
    loadLogs: (logs) => set({ messages: logs.map(log => ({ ...log, type: 'log' })) }),
    setFacilitatorStatus: (enabled) => set({ facilitatorEnabled: enabled }), // ★追加
    setActiveAiParticipants: (aiNames) => set({ activeAiParticipants: aiNames }), // ★追加
    addAiParticipantStore: (aiName) => // ★追加
        set((state) => ({ activeAiParticipants: [...state.activeAiParticipants, aiName] })),
    removeAiParticipantStore: (aiName) => // ★追加
        set((state) => ({
            activeAiParticipants: state.activeAiParticipants.filter(name => name !== aiName),
        })),

    processAiResponseMessage: (aiResponseMessage) => {
        set((state) => {
            // 応答してきたAIのusernameを取得 (aiResponseMessage.username が設定されている前提)
            const respondingAiUsername = aiResponseMessage.username;
            let refreshedMessages = state.messages;

            if (respondingAiUsername) {
                refreshedMessages = state.messages.filter(msg =>
                    !(
                        (msg.type === 'ai_thinking' || (msg.type === 'system_message' && msg.is_thinking === true)) &&
                        msg.username === respondingAiUsername
                    )
                );
            }
            // 新しいAI応答メッセージを、リフレッシュされたリストに追加
            return { messages: [...refreshedMessages, aiResponseMessage] };
        });
    },

    clearChat: () => set({
        myToken: null,
        myUsername: null,
        messages: [],
        users: [],
        isConnected: false,
        facilitatorEnabled: false, // ★クリア対象に追加
        activeAiParticipants: [], // ★クリア対象に追加
    }),
}));