// app/api/room/[room_id]/ai_participant/[ai_name]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// AI参加者追加
export async function POST(
    request: NextRequest, // request は使わないが、Next.jsの規約上必要
    { params }: { params: Promise<{ room_id: string; ai_name: string }> }
) {
    const { room_id, ai_name } = await params;
    try {
        const response = await fetch(`${FASTAPI_URL}/room/${room_id}/ai_participant/${ai_name}`, {
            method: 'POST',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errorData.detail || `Failed to add AI participant ${ai_name}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error adding AI participant ${ai_name}:`, error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : `Failed to add AI participant ${ai_name}` },
            { status: 500 }
        );
    }
}

// AI参加者削除
export async function DELETE(
    request: NextRequest, // request は使わない
    { params }: { params: Promise<{ room_id: string; ai_name: string }> }
) {
    const { room_id, ai_name } = await params;
    try {
        const response = await fetch(`${FASTAPI_URL}/room/${room_id}/ai_participant/${ai_name}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errorData.detail || `Failed to remove AI participant ${ai_name}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error removing AI participant ${ai_name}:`, error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : `Failed to remove AI participant ${ai_name}` },
            { status: 500 }
        );
    }
}