import { RotatingLine } from "./hero/Hero";

// components/SectionHeader.jsx
export default function SectionHeader({ title }) {
    return (
        <header className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                {title}
            </h1>
            <RotatingLine
                lines={[
                    "Delivered To You!",
                    "That Actually Work!",
                    "Simple. Safe. Effective.",
                ]}
                interval={2200}   // faster swap
                duration={450}    // faster animation
                className="text-3xl sm:text-4xl md:text-5xl text-darkprimary"
            />
        </header>
    );
}
