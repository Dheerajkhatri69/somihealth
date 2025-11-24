// lib/model/loginPageContent.js
import mongoose from "mongoose";

const loginPageContentSchema = new mongoose.Schema(
    {
        // Branding / navigation
        branding: {
            logoText: {
                type: String,
                default: "somi",
            },
            backLinkHref: {
                type: String,
                default: "/underdevelopmentmainpage",
            },
            backLinkLabel: {
                type: String,
                default: "Back",
            },
        },

        // Main texts
        texts: {
            title: {
                type: String,
                default: "Sign in",
            },
            description: {
                type: String,
                default: "Use your email and password",
            },
            emailLabel: {
                type: String,
                default: "Email",
            },
            passwordLabel: {
                type: String,
                default: "Password",
            },
            rememberLabel: {
                type: String,
                default: "Remember me",
            },
            forgotPasswordText: {
                type: String,
                default: "Forgot password?",
            },
            forgotPasswordHref: {
                type: String,
                default: "/forgot-password",
            },
            submitLabel: {
                type: String,
                default: "Sign in",
            },
            footerText: {
                type: String,
                default: "Don’t have an account?",
            },
            footerLinkText: {
                type: String,
                default: "Create one",
            },
            footerLinkHref: {
                type: String,
                default: "/register",
            },
        },

        // Right-side panel (image section)
        hero: {
            showRightPanel: {
                type: Boolean,
                default: true,
            },
            imageSrc: {
                type: String,
                default: "/hero/compounded-glp1.png",
            },
            imageAlt: {
                type: String,
                default: "Somi — patient care",
            },
        },

        // Extra config / toggles
        config: {
            isActive: { type: Boolean, default: true },
            showRememberMe: { type: Boolean, default: true },
            showForgotPassword: { type: Boolean, default: true },
            showFooterLink: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

// Ensure only one active config
loginPageContentSchema.index(
    { "config.isActive": 1 },
    {
        unique: true,
        partialFilterExpression: { "config.isActive": true },
    }
);

const LoginPageContent =
    mongoose.models.LoginPageContent ||
    mongoose.model("LoginPageContent", loginPageContentSchema);

export default LoginPageContent;
