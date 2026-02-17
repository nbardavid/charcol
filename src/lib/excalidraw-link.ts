export class ShareLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShareLinkError";
  }
}

function parseShareLink(url: string): { id: string; decryptionKey: string } | null {
  try {
    const hash = new URL(url).hash.slice(1);
    const match = hash.match(/^json=([^,]+),(.+)$/);
    if (!match) return null;
    return { id: match[1], decryptionKey: match[2] };
  } catch {
    return null;
  }
}

function splitBuffers(buffer: Uint8Array): Uint8Array[] {
  // First 4 bytes are a version int32 (big-endian)
  let offset = 4;
  const chunks: Uint8Array[] = [];
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  while (offset < buffer.byteLength) {
    if (offset + 4 > buffer.byteLength) break;
    const chunkLength = view.getInt32(offset, false); // big-endian
    offset += 4;
    if (chunkLength < 0 || offset + chunkLength > buffer.byteLength) {
      throw new Error("Invalid chunk length");
    }
    chunks.push(buffer.slice(offset, offset + chunkLength));
    offset += chunkLength;
  }

  if (chunks.length < 3) {
    throw new Error("Expected at least 3 chunks");
  }

  return chunks;
}

async function importKey(decryptionKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    {
      alg: "A128GCM",
      ext: true,
      k: decryptionKey,
      key_ops: ["encrypt", "decrypt"],
      kty: "oct",
    },
    { name: "AES-GCM", length: 128 },
    false,
    ["decrypt"],
  );
}

async function decryptAesGcm(
  key: CryptoKey,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );
}

export async function fetchExcalidrawShareLink(url: string): Promise<string> {
  const parsed = parseShareLink(url);
  if (!parsed) {
    throw new ShareLinkError(
      "Invalid Excalidraw share link. Expected format: https://excalidraw.com/#json={id},{key}",
    );
  }

  const { id, decryptionKey } = parsed;

  // Fetch encrypted data
  const response = await fetch(`https://json.excalidraw.com/api/v2/${id}`);
  if (!response.ok) {
    throw new ShareLinkError(
      response.status === 404
        ? "Shared diagram not found. The link may have expired."
        : `Failed to fetch shared diagram (HTTP ${response.status}).`,
    );
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  const key = await importKey(decryptionKey);

  // Try splitBuffers format, then legacy fallbacks
  let decrypted: ArrayBuffer;
  let encodingMetadata: Uint8Array | null = null;

  try {
    const chunks = splitBuffers(buffer);
    encodingMetadata = chunks[0];
    decrypted = await decryptAesGcm(key, chunks[1], chunks[2]);
  } catch {
    // Fallback 1: IV = first 12 bytes, ciphertext = rest
    try {
      const iv = buffer.slice(0, 12);
      const ciphertext = buffer.slice(12);
      decrypted = await decryptAesGcm(key, iv, ciphertext);
    } catch {
      // Fallback 2: IV = zeros
      try {
        const iv = new Uint8Array(12);
        decrypted = await decryptAesGcm(key, iv, buffer);
      } catch {
        throw new ShareLinkError(
          "Failed to decrypt the shared diagram. The link may be invalid or corrupted.",
        );
      }
    }
  }

  // Decompress if needed
  let raw: Uint8Array;
  const needsDecompression = encodingMetadata && checkCompression(encodingMetadata);

  if (needsDecompression) {
    const { inflate } = await import("pako");
    raw = inflate(new Uint8Array(decrypted));
  } else {
    // Try decompression anyway — legacy data may be compressed without metadata
    try {
      const { inflate } = await import("pako");
      raw = inflate(new Uint8Array(decrypted));
    } catch {
      raw = new Uint8Array(decrypted);
    }
  }

  // The decompressed data may have a prefix before the JSON (e.g. scene version).
  // Find the first '{' to locate the start of the Excalidraw JSON.
  const decoded = new TextDecoder().decode(raw);
  const jsonStart = decoded.indexOf("{");
  if (jsonStart === -1) {
    throw new ShareLinkError("Decrypted data does not contain valid JSON.");
  }

  return decoded.slice(jsonStart);
}

function checkCompression(metadata: Uint8Array): boolean {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(metadata));
    return Boolean(parsed.compression);
  } catch {
    return false;
  }
}
