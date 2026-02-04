// Prefer a server-only connection string. Fallback kept for backward compatibility.
// Recommended: set `MONGODB_URI` in your environment.
const uriFromEnv = process.env.MONGODB_URI;

const username = process.env.MONGODB_USERNAME ?? process.env.NEXT_PUBLIC_USERNAME;
const password = process.env.MONGODB_PASSWORD ?? process.env.NEXT_PUBLIC_PASSWORD;

export const connectionSrt =
    uriFromEnv ||
    `mongodb+srv://${username}:${password}@cluster0.oxhylf1.mongodb.net/somihealth?retryWrites=true&w=majority&appName=Cluster0`;