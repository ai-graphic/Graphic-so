import { google } from 'googleapis';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.OAUTH2_REDIRECT_URI
    );

    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ message: 'User not found' });
    }

    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
        userId,
        'oauth_google'
    );

    if (!clerkResponse.data[0] || !clerkResponse.data[0].token) {
        return NextResponse.json({ message: 'Failed to retrieve access token' });
    }

    const accessToken = clerkResponse.data[0].token;
    oauth2Client.setCredentials({
        access_token: accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Getting the latest start page token
    const startPageTokenRes = await drive.changes.getStartPageToken({});
    const startPageToken = startPageTokenRes.data.startPageToken;
    if (!startPageToken) {
        return NextResponse.json({ message: 'Failed to retrieve start page token' });
    }

    // Call changes.list to fetch changes
    const changesRes = await drive.changes.list({
        pageToken: '1530',
        fields: '*',
        supportsAllDrives: true
    });

    if (changesRes.status !== 200) {
        return NextResponse.json({ message: 'Failed to list changes', error: changesRes });
    }

    // console.log('Changes:', changesRes.data.changes); // Log the changes

    // If successful, send the changes back to the client
    return NextResponse.json({ changes: changesRes.data.changes, newStartPageToken: changesRes.data.newStartPageToken });
}
