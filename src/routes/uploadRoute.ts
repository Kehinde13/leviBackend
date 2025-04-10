import { IncomingForm } from 'formidable';
import fs from 'fs';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Form parsing failed", error: err });
    }

    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const stream = fs.createReadStream(file.filepath);
      const blob = await put(file.originalFilename || "default name", stream, {
        access: 'public',
      });

      return res.status(200).json({ imageUrl: blob.url });
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      return res.status(500).json({ message: "Image upload failed", error: uploadErr });
    }
  });
}
