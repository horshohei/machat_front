// hooks/useChatWebSocket.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore, Message, User, ChatState } from '@/store/chatStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const useChatWebSocket = (roomId: string, inputUsername: string) => {
    const {
        addMessage,
        setUsers,
        setConnected,
        loadLogs,
        clearChat,
        setMyInfo,
        setFacilitatorStatus, // ★追加
        setActiveAiParticipants, // ★追加
        processAiResponseMessage,
    } = useChatStore();
    const ws = useRef<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const updateCommonState = (data: Message) => {
        if (typeof data.facilitator_enabled === 'boolean') {
            setFacilitatorStatus(data.facilitator_enabled);
        }
        if (data.active_user) {
            setUsers(data.active_user as User[]);
        }
        if (Array.isArray(data.active_ai_participants)) {
            setActiveAiParticipants(data.active_ai_participants);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const connectWebSocket = async () => {
            if (!roomId) {
                console.warn("Room ID is not yet available. Waiting...");
                return;
            }

            clearChat();
            setError(null);

            try {
                const tokenResponse = await fetch('/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: inputUsername }), // ★ ここでusernameを送信
                });
                if (!tokenResponse.ok) {
                    const errData = await tokenResponse.json();
                    throw new Error(errData.error || 'Failed to get token');
                }
                const { token, username } = await tokenResponse.json(); // username を受け取る

                if (!isMounted || !roomId) return;

                setMyInfo(token, username); // ストアに保存

                const socket = new WebSocket(`${WS_URL}/ws/${roomId}?token=${token}`);
                ws.current = socket;

                socket.onopen = () => {
                    if (isMounted) {
                        console.log('WebSocket connected');
                        setConnected(true);
                        setError(null);
                    }
                };

                socket.onmessage = (event) => {
                    if (isMounted) {
                        console.log('WebSocket message received:', event.data);
                        try {
                            const data = JSON.parse(event.data) as Message; // 型アサーション
                            const now = new Date().toISOString();


                            // バックエンド仕様に合わせて型をチェックし、不足情報を補う
                            switch (data.type) {
                                case 'join':
                                    // FastAPI側で user オブジェクトに id と name が含まれるように修正済みと仮定
                                    setUsers(data.users as User[] || []);
                                    addMessage({
                                        type: 'join',
                                        user_id: data.user_id,
                                        // usernameが返ってこない場合、自分の場合はmyUsernameを使う
                                        message: `${data.user_id === useChatStore.getState().myToken ? useChatStore.getState().myUsername : (data.username || data.user_id.slice(0, 8))} が参加しました。`,
                                        timestamp: data.timestamp || new Date().toISOString(),
                                    });
                                    if (data.chat_log) {
                                        loadLogs(data.chat_log);
                                    }
                                    // ★ファシリテーターとAI参加者状態を更新
                                    updateCommonState(data);
                                    break;
                                case 'leave':
                                    setUsers(data.users as User[] || []);
                                    addMessage({
                                        type: 'leave',
                                        user_id: data.user_id,
                                        message: `${data.username || data.user_id.slice(0, 8)} が退出しました。`,
                                        timestamp: data.timestamp || new Date().toISOString(),
                                    });
                                    // ★ファシリテーターとAI参加者状態を更新 (もしサーバーが送るなら)
                                    updateCommonState(data);
                                    break;
                                case 'chat':
                                    // dataにis_thinkingがあり、かつFalseであれば、AIのメッセージ
                                    if (data.is_thinking === false) {
                                        processAiResponseMessage(data);
                                    } else {
                                        addMessage({
                                            ...data,
                                            timestamp: data.timestamp || new Date().toISOString(),
                                        });
                                        // active_user も User[] 型を期待
                                        updateCommonState(data);
                                    }
                                    break;
                                case 'system_message':
                                    updateCommonState(data);
                                    // UIに通知メッセージを表示しても良い (オプション)
                                    addMessage({
                                        ...data,
                                        timestamp: data.timestamp || new Date().toISOString(),
                                    });
                                    break;


                                default:
                                    addMessage({
                                        ...data,
                                        timestamp: data.timestamp || now,
                                    });
                                    updateCommonState(data);
                                    break;
                            }

                        } catch (e) {
                            console.error('Failed to parse message or update state:', e);
                            addMessage({ type: 'error', user_id: 'System', message: `Error processing message: ${event.data}`, timestamp: new Date().toISOString()});
                        }
                    }
                };

                socket.onclose = (event) => {
                    if (isMounted) {
                        console.log('WebSocket closed:', event.reason, event.code);
                        setConnected(false);
                        // 認証エラー (1008) などのハンドリング
                        if (event.code === 1008) {
                            setError(`接続に失敗しました: ${event.reason || '認証エラー'}`);
                        } else if (!event.wasClean) {
                            setError(`接続が予期せず切れました: ${event.reason || '不明なエラー'}`);
                        }
                        ws.current = null;
                    }
                };

                socket.onerror = (event) => {
                    if (isMounted) {
                        console.error('WebSocket error:', event);
                        setError('WebSocket接続エラーが発生しました。');
                        setConnected(false);
                        ws.current = null;
                    }
                };

            } catch (err) {
                if (isMounted) {
                    console.error('WebSocket connection setup failed:', err);
                    setError(err instanceof Error ? err.message : '接続に失敗しました。');
                    setConnected(false);
                }
            }
        };

        connectWebSocket();

        return () => {
            isMounted = false;
            if (ws.current) {
                console.log('Closing WebSocket connection...');
                ws.current.close();
                ws.current = null;
            }
            clearChat();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, inputUsername]); // 依存配列を見直し (関数をメモ化するか、依存を明示)

    const sendMessage = (message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                const payload = JSON.stringify({ message });
                ws.current.send(payload);
            } catch (e) {
                console.error("Failed to send message:", e);
                setError("メッセージの送信に失敗しました。");
            }
        } else {
            setError('WebSocket is not connected.');
            console.error('WebSocket is not connected.');
        }
    };

    return { sendMessage, error };
};