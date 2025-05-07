const username = process.env.NEXT_PUBLIC_USERNAME;
const password = process.env.NEXT_PUBLIC_PASSWORD;
export const connectionSrt = `mongodb+srv://${username}:${password}@cluster0.oxhylf1.mongodb.net/somihealth?retryWrites=true&w=majority&appName=Cluster0`;