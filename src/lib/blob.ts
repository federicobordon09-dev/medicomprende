import { put, del, list } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

const BLOB_PREFIX = "studies";
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function ensureLocalDir() {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
}

export async function uploadPdf(
  buffer: Buffer,
  fileName: string,
  userId: string
): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blobFileName = `${BLOB_PREFIX}/${userId}/${Date.now()}-${safeName}`;

  if (hasBlobToken()) {
    const blob = await put(blobFileName, buffer, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await ensureLocalDir();
  const localPath = path.join(LOCAL_DIR, blobFileName);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buffer);

  // Clean up local file after successful write (only text analysis results persist)
  // The raw PDF is only needed temporarily for Gemini analysis
  try {
    const scheduleDelete = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300_000)); // 5 min
      await fs.unlink(localPath).catch(() => {});
    };
    scheduleDelete();
  } catch {
    // Cleanup is best-effort
  }

  return `/uploads/${blobFileName}`;
}

export async function deletePdf(url: string): Promise<void> {
  if (hasBlobToken()) {
    await del(url);
    return;
  }

  const localPath = path.join(LOCAL_DIR, url.replace("/uploads/", ""));
  try { await fs.unlink(localPath); } catch { /* ignore */ }
}

export async function listUserPdfs(userId: string): Promise<string[]> {
  if (hasBlobToken()) {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}/${userId}/` });
    return blobs.map((b) => b.url);
  }

  const userDir = path.join(LOCAL_DIR, BLOB_PREFIX, userId);
  try {
    const files = await fs.readdir(userDir);
    return files.map((f) => `/uploads/${BLOB_PREFIX}/${userId}/${f}`);
  } catch {
    return [];
  }
}
