// components/Message.tsx
import { Message as MessageType, useChatStore, User } from '@/store/chatStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const formatTimestamp = (isoString: string | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error("Invalid timestamp format:", isoString, e);
        return '';
    }
};

// user_id と message.username を使って表示名を決定するヘルパー関数
const getDisplayName = (
    message: MessageType, // メッセージオブジェクト全体を渡す
    users: User[],
    myToken: string | null,
    myUsername: string | null
): string => {
    // 優先的に message.username を使用 (バックエンドがAI名などを設定している場合)
    if (message.username) return message.username;

    // user_id がない場合はデフォルト名を返す
    if (!message.user_id) return 'システム';

    if (message.user_id === myToken) return myUsername || '自分';
    if (message.user_id === 'AIAssistantFacilitator') return 'AIファシリテーター';
    if (message.user_id.startsWith('AIAssistant_') && !message.user_id.endsWith('_thinking')) {
        // AIAssistant_ の後の部分がAIの内部名
        const aiInternalName = message.user_id.substring('AIAssistant_'.length);
        // TODO: activeAiParticipants ストアなどから表示名を取得するロジックをここに統合するのも良い
        return `AI (${aiInternalName})`; // 仮の表示
    }
    if (message.user_id.endsWith('_thinking')) {
        let baseId = message.user_id.replace('_thinking', '');
        if (baseId === 'AIAssistantFacilitator') return 'AIファシリテーター';
        if (baseId.startsWith('AIAssistant_')) return `AI (${baseId.substring('AIAssistant_'.length)})`;
        return 'AI';
    }

    const sender = users.find(u => u.id === message.user_id);
    return sender?.name || message.user_id.slice(0, 16) + '...';
};


export const Message = ({ message }: { message: MessageType }) => {
    const { myToken, myUsername, users } = useChatStore();

    const isThinkingMessage = message.is_thinking === true;
    const isSystemNotification = // システム通知系のメッセージタイプを定義
        message.type === 'join' ||
        message.type === 'leave' ||
        message.type === 'error' ||
        message.type === 'config_update' ||
        (message.type === 'system_message' && !isThinkingMessage);

    // メッセージタイプごとの処理
    if (isThinkingMessage) {
        // 思考中メッセージの表示
        const thinkingDisplayName = message.username || (message.user_id ? message.user_id.replace('_thinking', '').replace('AIAssistantFacilitator', 'AIファシリテーター').replace('AIAssistant_', 'AI ') : "AI");
        return (
            <div className="my-2 py-2 px-4 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs w-auto mx-auto max-w-md shadow-sm animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{thinkingDisplayName}が応答を準備中です...</span>
                </div>
            </div>
        );
    }

    if (isSystemNotification) {
        // システム通知メッセージの表示 (user_id に依存しない)
        return (
            <div className="text-center text-xs text-gray-500 my-2 px-2">
                <span>
                    {message.message}
                </span>
                <span className="ml-2 opacity-80">{formatTimestamp(message.timestamp)}</span>
            </div>
        );
    }

    // 以下は通常のチャットメッセージ (人間またはAIの応答)
    // この時点で user_id が存在することを期待するが、念のためチェック
    if (!message.user_id && message.type === 'chat') {
        console.error("Chat message without user_id:", message);
        return (
            <div className="text-center text-xs text-red-500 my-2 px-2">
                [エラー: 送信者不明のチャットメッセージ]
                <span className="ml-2 opacity-80">{formatTimestamp(message.timestamp)}</span>
            </div>
        );
    }

    // user_id が存在する場合の処理
    const isMe = message.user_id === myToken;
    const isFacilitator = message.user_id === 'AIAssistantFacilitator';
    const isAIParticipant = message.user_id?.startsWith('AIAssistant_') && !isFacilitator; // Optional chaining

    const displayName = getDisplayName(message, users, myToken, myUsername);

    return (
        <div className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`rounded-lg p-3 max-w-3xl shadow-sm ${
                    isMe
                        ? 'bg-blue-600 text-white'
                        : isFacilitator
                            ? 'bg-purple-600 text-white'
                            : isAIParticipant
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                }`}
            >
                {!isMe && (
                    <div className="font-bold mb-1 text-sm">
                        {isFacilitator ? '👑 ' : isAIParticipant ? '🤖 ' : '👤 '}
                        {displayName}
                    </div>
                )}
                <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-blockquote:my-1 prose-a:text-blue-500 hover:prose-a:text-blue-400 dark:prose-invert dark:prose-a:text-blue-400">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-inherit hover:underline" />,
                        }}
                    >
                        {message.message}
                    </ReactMarkdown>
                </div>
                <div className={`text-xs mt-2 opacity-70 ${isMe ? 'text-blue-200' : (isFacilitator || isAIParticipant) ? 'text-gray-300' : 'text-gray-500'} text-right`}>
                    {formatTimestamp(message.timestamp)}
                </div>
            </div>
        </div>
    );
};