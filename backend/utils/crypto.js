import crypto from "crypto";

const RAW_KEY = process.env.TOKEN_ENCRYPTION_KEY;

if (!RAW_KEY) {
  throw new Error(
    "TOKEN_ENCRYPTION_KEY is missing. Set it in your .env file (32-byte hex string)."
  );
}

const KEY = Buffer.from(RAW_KEY, "hex");

if (KEY.length !== 32) {
  throw new Error(
    "TOKEN_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)."
  );
}

const ALGORITHM = "aes-256-gcm";

export const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
};

export const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(hash.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(hash.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};