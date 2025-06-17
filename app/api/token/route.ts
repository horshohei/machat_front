// app/api/token/route.ts
import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8080';

export async function POST(request: Request) { // request を受け取るように変更
    try {
        const body = await request.json(); // ★ bodyからデータを取得
        const inputUsername = body.username; // ★ usernameを取得
        // クライアントから username を受け取る場合 (オプション)
        // const body = await request.json().catch(() => ({}));
        // const usernameToSend = body.username || `User_${Date.now().toString().slice(-4)}`;

        const response = await fetch(`${FASTAPI_URL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // ★ FastAPIにusernameを転送
            body: JSON.stringify({ username: inputUsername }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Failed to fetch token: ${response.statusText}`, errorData);
            throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json(); // { token: "...", username: "..." } を期待

        if (!data.token || !data.username) {
            console.error("Token or Username not found in response", data);
            throw new Error("Token or Username not found in response");
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json(
            { error: `Failed to fetch token: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}