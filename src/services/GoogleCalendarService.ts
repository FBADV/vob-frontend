declare const gapi: any;
declare const google: any;

export class GoogleCalendarService {
    private tokenClient: any;
    private isInitialized = false;

    async initialize(clientId: string, apiKey: string) {
        if (this.isInitialized) return;

        return new Promise<void>((resolve, reject) => {
            if (typeof gapi === 'undefined' || typeof google === 'undefined') {
                reject(new Error('Google scripts not loaded'));
                return;
            }

            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    });

                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: 'https://www.googleapis.com/auth/calendar.events',
                        callback: '', // defined at request time
                    });

                    this.isInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async initiateAuth(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.tokenClient.callback = (resp: any) => {
                    if (resp.error) {
                        reject(resp);
                    }
                    resolve();
                };
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (error) {
                reject(error);
            }
        });
    }

    async listEvents(calendarId: string = 'primary'): Promise<any[]> {
        try {
            const response = await gapi.client.calendar.events.list({
                'calendarId': calendarId,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            });
            return response.result.items;
        } catch (error) {
            console.error('Error listing events', error);
            throw error;
        }
    }

    async createEvent(event: any, calendarId: string = 'primary'): Promise<any> {
        try {
            const response = await gapi.client.calendar.events.insert({
                'calendarId': calendarId,
                'resource': event
            });
            return response.result;
        } catch (error) {
            console.error('Error creating event', error);
            throw error;
        }
    }
}

export const googleCalendarService = new GoogleCalendarService();
