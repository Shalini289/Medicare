const crypto = require("crypto");

const PREFIX = "enc:v1";

const getKey = () => {
  const secret = process.env.RECORD_ENCRYPTION_KEY || process.env.JWT_SECRET || "medicare-local-record-key";
  return crypto.createHash("sha256").update(secret).digest();
};

const encryptString = (value) => {
  if (!value || typeof value !== "string" || value.startsWith(`${PREFIX}:`)) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

const decryptString = (value) => {
  if (!value || typeof value !== "string" || !value.startsWith(`${PREFIX}:`)) {
    return value;
  }

  try {
    const [, , iv, tag, encrypted] = value.split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
};

const encryptList = (items = []) => items.map((item) => encryptString(item));
const decryptList = (items = []) => items.map((item) => decryptString(item)).filter(Boolean);

module.exports = {
  decryptList,
  decryptString,
  encryptList,
  encryptString,
};
