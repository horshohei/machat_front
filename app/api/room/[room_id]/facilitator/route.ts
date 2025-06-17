// app/api/room/[room_id]/facilitator/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8080';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ room_id: string }> }
) {
    const { room_id } = await params;
    const body = await request.json();
    const enable = body.enable; // { "enable": true/false } を期待

    if (typeof enable !== 'boolean') {
        return NextResponse.json({ error: 'Invalid "enable" parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(`${FASTAPI_URL}/room/${room_id}/facilitator?enable=${enable}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errorData.detail || 'Failed to toggle facilitator');
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error toggling facilitator:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to toggle facilitator' },
            { status: 500 }
        );
    }
}