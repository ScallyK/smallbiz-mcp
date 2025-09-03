import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = path.join(process.cwd(), 'src/clients/google_creds/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'src/clients/google_creds/credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {

    try {

        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content.toString());
        const client = google.auth.fromJSON(credentials);

        // Only return if the client is an OAuth2Client
        if (client instanceof OAuth2Client) {
            return client;
        }

        return null;

    }
    catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */

interface CredentialsKey {
    client_id: string;
    client_secret: string;
    [key: string]: any;
}

interface CredentialsFile {
    installed?: CredentialsKey;
    web?: CredentialsKey;
    [key: string]: any;
}

interface AuthorizedUserPayload {
    type: 'authorized_user';
    client_id: string;
    client_secret: string;
    refresh_token: string;
}


async function saveCredentials(client: OAuth2Client): Promise<void> {

    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys: CredentialsFile = JSON.parse(content.toString());
    const key: CredentialsKey | undefined = keys.installed || keys.web;

    if (!key) {
        throw new Error('No client credentials found in credentials file.');
    }

    const payload: AuthorizedUserPayload = {
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: (client.credentials as { refresh_token: string }).refresh_token,
    };

    await fs.writeFile(TOKEN_PATH, JSON.stringify(payload));
}

/**
 * Load or request or authorization to call APIs.
 *
 */

async function authorizeGoogleClient() {

    let client: OAuth2Client | null = await loadSavedCredentialsIfExist();

    if (client) {
        return client;
    }

    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    }) as OAuth2Client;

    if (client.credentials) {
        await saveCredentials(client);
    }

    return client;
}

export default authorizeGoogleClient;

