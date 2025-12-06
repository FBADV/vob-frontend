// iCal Parser Service
export class ICalService {
    /**
     * Fetches and parses an iCal feed from a URL
     */
    static async fetchAndParseICal(url: string): Promise<any[]> {
        try {
            console.log('Fetching iCal from:', url);

            // Fetch the iCal file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch iCal: ${response.statusText}`);
            }

            const icalData = await response.text();
            console.log('iCal data received, parsing...');

            return this.parseICal(icalData);
        } catch (error) {
            console.error('Error fetching iCal:', error);
            throw error;
        }
    }

    /**
     * Parses iCal format string into event objects
     */
    static parseICal(icalString: string): any[] {
        const events: any[] = [];
        const lines = icalString.split(/\r?\n/);

        let currentEvent: any = null;
        let inEvent = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                currentEvent = {};
            } else if (line === 'END:VEVENT') {
                if (currentEvent) {
                    events.push(currentEvent);
                }
                inEvent = false;
                currentEvent = null;
            } else if (inEvent && currentEvent) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex);
                    const value = line.substring(colonIndex + 1);

                    // Parse common iCal fields
                    if (key.startsWith('DTSTART')) {
                        currentEvent.start = this.parseICalDate(value);
                    } else if (key.startsWith('DTEND')) {
                        currentEvent.end = this.parseICalDate(value);
                    } else if (key === 'SUMMARY') {
                        currentEvent.title = value;
                    } else if (key === 'DESCRIPTION') {
                        currentEvent.description = value.replace(/\\n/g, '\n');
                    } else if (key === 'LOCATION') {
                        currentEvent.location = value;
                    } else if (key === 'UID') {
                        currentEvent.id = value;
                    }
                }
            }
        }

        console.log(`Parsed ${events.length} events from iCal`);
        return events;
    }

    /**
     * Parses iCal date format (YYYYMMDDTHHMMSS or YYYYMMDD)
     */
    static parseICalDate(dateString: string): Date {
        // Remove timezone info for simplicity
        const cleanDate = dateString.split('Z')[0].split('T')[0];

        if (cleanDate.length === 8) {
            // YYYYMMDD format
            const year = parseInt(cleanDate.substring(0, 4));
            const month = parseInt(cleanDate.substring(4, 6)) - 1;
            const day = parseInt(cleanDate.substring(6, 8));
            return new Date(year, month, day);
        } else if (dateString.includes('T')) {
            // YYYYMMDDTHHMMSS format
            const [datePart, timePart] = dateString.split('T');
            const year = parseInt(datePart.substring(0, 4));
            const month = parseInt(datePart.substring(4, 6)) - 1;
            const day = parseInt(datePart.substring(6, 8));
            const hour = parseInt(timePart.substring(0, 2));
            const minute = parseInt(timePart.substring(2, 4));
            return new Date(year, month, day, hour, minute);
        }

        return new Date();
    }

    /**
     * Converts iCal events to app task format
     */
    static convertToTasks(icalEvents: any[]): any[] {
        return icalEvents.map(event => ({
            id: event.id || crypto.randomUUID(),
            title: event.title || 'Sem título',
            time: event.start ? format(event.start, 'HH:mm') : '00:00',
            date: event.start ? format(event.start, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            completed: false,
            type: 'meeting',
            description: event.description,
            location: event.location,
            source: 'ical'
        }));
    }
}

function format(date: Date, formatStr: string): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (formatStr === 'HH:mm') {
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else if (formatStr === 'yyyy-MM-dd') {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    return date.toISOString();
}
