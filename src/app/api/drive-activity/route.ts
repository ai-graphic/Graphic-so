import { google } from 'googleapis'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'

export async function GET() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.OAUTH2_REDIRECT_URI
    )

    const { userId } = auth()
    if (!userId) {
        return NextResponse.json({ message: 'User not found' })
    }

    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
        userId,
        'oauth_google'
    )

    const accessToken = clerkResponse.data[0].token
    oauth2Client.setCredentials({
        access_token: accessToken,
    })

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
    })

    const channelId = uuidv4()

    const startPageTokenRes = await drive.changes.getStartPageToken({})
    const startPageToken = startPageTokenRes.data.startPageToken
    if (startPageToken == null) {
        throw new Error('startPageToken is unexpectedly null')
    }
    console.log(startPageToken);

    // // Call changes.list to fetch changes
    // const changes = await drive.changes.list({
    //     pageToken: startPageToken,
    //     fields: 'newStartPageToken, changes(fileId, file(name, mimeType, trashed))',
    // });
    //
    // console.log('Changes:', changes.data.changes); // Log the changes

    const listener = await drive.changes.watch({
        pageToken: startPageToken,
        supportsAllDrives: true,
        supportsTeamDrives: true,
        requestBody: {
            id: channelId,
            type: 'web_hook',
            address:
                `https://workflow-ai.vercel.app/api/drive-activity/notification`,
            kind: 'api#channel',
        },
    })
    if (listener.status == 200) {
        console.log(listener)
        //if listener created store its channel id in db
        const channelStored = await db.user.updateMany({
            where: {
                clerkId: userId,
            },
            data: {
                googleResourceId: listener.data.resourceId,
            },
        })

        if (channelStored) {
            return new NextResponse('Listening to changes...')
        }
    }

    return new NextResponse('Oops! something went wrong, try again')
}

// import { google } from 'googleapis';
// import { auth, clerkClient } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';
//
// export async function GET() {
//     const oauth2Client = new google.auth.OAuth2(
//         process.env.GOOGLE_CLIENT_ID,
//         process.env.GOOGLE_CLIENT_SECRET,
//         process.env.OAUTH2_REDIRECT_URI
//     );
//
//     const { userId } = auth();
//     if (!userId) {
//         return NextResponse.json({ message: 'User not found' });
//     }
//
//     const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
//         userId,
//         'oauth_google'
//     );
//     const accessToken = clerkResponse.data[0].token;
//     oauth2Client.setCredentials({
//         access_token: accessToken,
//     });
//
//     const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
//
//     // Specify the Spreadsheet ID and range
//     const spreadsheetId = '1Mj828zcJ3iIVxYhdckR-CiiVVywqiqFOcOusUCdNFo8'; // Replace with your actual spreadsheet ID
//     const range = 'Sheet1!A1:D5'; // Adjust the range according to your needs
//
//     try {
//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId,
//             range,
//         });
//
//         console.log('Data from Sheets:', response.data);
//         return NextResponse.json({ data: response.data });
//     } catch (error) {
//         console.error('The API returned an error: ' + error);
//         return NextResponse.json({ message: 'Failed to fetch data from Sheets', error: error });
//     }
// }
