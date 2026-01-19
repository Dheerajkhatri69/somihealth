import mongoose from "mongoose";
import { connectionSrt } from "./db";
import { UserCredential } from "./model/userCredential";

/**
 * Generate a random password with specific requirements:
 * - Total: 12 characters
 * - 1 uppercase letter
 * - 4 numbers
 * - 1 special character
 * - Remaining 6 characters: lowercase letters
 */
export function generatePassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";

    const getRandomChar = (chars) => chars[Math.floor(Math.random() * chars.length)];

    // Build password parts
    const parts = [
        getRandomChar(uppercase),           // 1 uppercase
        getRandomChar(special),             // 1 special
        ...Array(4).fill(0).map(() => getRandomChar(numbers)),    // 4 numbers
        ...Array(6).fill(0).map(() => getRandomChar(lowercase)),  // 6 lowercase
    ];

    // Shuffle the array to randomize positions
    for (let i = parts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [parts[i], parts[j]] = [parts[j], parts[i]];
    }

    return parts.join("");
}

/**
 * Generate a unique userId
 */
function generateUserId() {
    return `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * Ensure a UserCredential exists for the given email.
 * If it doesn't exist, create one with auto-generated password and userId.
 * @param {string} email - User's email
 * @returns {Promise<Object>} The UserCredential document
 */
export async function ensureUserCredential(email) {
    try {
        // Ensure DB connection
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        // Check if user credential already exists
        let credential = await UserCredential.findOne({ email });

        if (!credential) {
            // Create new credential
            const password = generatePassword();
            const userId = generateUserId();

            credential = new UserCredential({
                email,
                password,
                userId,
            });

            await credential.save();
            console.log(`✅ Created new user credential for: ${email}`);
        } else {
            console.log(`ℹ️ User credential already exists for: ${email}`);
        }

        return credential;
    } catch (error) {
        console.error("Error in ensureUserCredential:", error);
        throw error;
    }
}
