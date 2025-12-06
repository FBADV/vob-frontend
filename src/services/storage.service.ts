import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'documents';

export const storageService = {
    /**
     * Uploads a file to Supabase Storage
     * @param file The file object to upload
     * @param folder The folder path (e.g., 'process_id' or 'client_id')
     * @returns The path of the uploaded file
     */
    async uploadFile(file: File, folder: string): Promise<string> {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Sanitize filename
        const timestamp = new Date().getTime();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `${folder}/${timestamp}_${cleanFileName}`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        return filePath;
    },

    /**
     * Generates a signed URL for a file
     * @param path The file path in storage
     * @param expiresIn Seconds until expiration (default 1 hour)
     */
    async getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
        if (!supabase) return null;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    },

    /**
     * Deletes a file from storage
     * @param path The file path in storage
     */
    async deleteFile(path: string): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};
