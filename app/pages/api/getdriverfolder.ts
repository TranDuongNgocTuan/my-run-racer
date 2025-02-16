import type { NextApiRequest, NextApiResponse } from 'next'

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const folderId = process.env.FOLDER_ID;
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!folderId || !apiKey) {
        return res.status(500).json({ error: "Missing API Key or Folder ID" });
    }

    try {
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType)`;

        const response = await fetch(driveApiUrl);
        const data = await response.json();

        if (!data.files) {
            return res.status(500).json({ error: "Failed to fetch files" });
        }

        const files = data.files.map((file: DriveFile) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            url: `https://drive.google.com/uc?export=view&id=${file.id}`
        }));

        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}
