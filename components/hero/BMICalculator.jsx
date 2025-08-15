"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";

/* helpers */
const lbToKg = (lb) => lb * 0.45359237;
const kgToLb = (kg) => kg / 0.45359237;
const ftInToMeters = (ft, inches) => (ft * 12 + inches) * 0.0254;

/* small icon */
const Info = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v.01M12 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/* ===== Height chips ===== */
function HeightPicker({ feet, inches, onFeet, onInches }) {
    const feetOptions = [4, 5, 6, 7];
    const inchOptions = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800">
                Selected: <span className="text-xl font-SofiaSans font-bold">{feet}′ {inches}″</span>
            </div>

            {/* feet segmented */}
            <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600">Feet</div>
                <div role="tablist" aria-label="Feet" className="grid grid-cols-4 overflow-hidden rounded-full ring-1 ring-blue-400">
                    {feetOptions.map((f, idx) => {
                        const active = f === feet;
                        return (
                            <div
                                role="tab"
                                aria-selected={active}
                                tabIndex={0}
                                key={idx}
                                onClick={() => onFeet(f)}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onFeet(f)}
                                className={`cursor-pointer px-3 py-2 text-center text-sm font-medium transition ${active ? "bg-secondary text-white"
                                    : "bg-white text-secondary hover:bg-secondary hover:text-white"
                                    } ${idx !== feetOptions.length - 1 ? "border-r border-blue-200/60" : ""}`}
                            >
                                {f}′
                            </div>

                        );
                    })}
                </div>
            </div>

            {/* inches – mobile scroll, desktop wrap */}
            <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600">Inches</div>
                <div className="
          no-scrollbar flex gap-2 overflow-x-auto whitespace-nowrap py-1
          flex-wrap 
        ">
                    {inchOptions.map((inch) => {
                        const active = inch === inches;
                        return (
                            <button
                                key={inch}
                                onClick={() => onInches(inch)}
                                className={`rounded-full border px-2.5 py-1.5 text-[13px] sm:px-3 sm:text-sm transition ${active ? "border-secondary bg-secondary text-white"
                                    : "border-blue-400 bg-white text-secondary hover:bg-secondary hover:text-white"
                                    }`}
                            >
                                {inch}″
                            </button>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}

/* ===== Result tile ===== */
function ResultCard({ title, value, unit = "", help, color }) {
    return (
        <div className={`flex flex-col items-center font-SofiaSans justify-center rounded-3xl bg-gradient-to-br ${color} px-4 py-5 text-secondary shadow`}>
            <span className="mb-1 text-xs font-medium uppercase tracking-wide text-secondary/70">{title}</span>
            <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold sm:text-5xl">{value}</span>
                {unit && <span className="mb-1 text-base font-semibold">{unit}</span>}
            </div>
            {help && (
                <span className="mt-2 flex items-center gap-1 text-xs text-secondary/80">
                    <Info /> {help}
                </span>
            )}
        </div>
    );
}

/* ===== Main calculator ===== */
export default function BMICalculator() {
    const [unit, setUnit] = useState("lbs");
    const [weight, setWeight] = useState("153");
    const [goalWeight, setGoalWeight] = useState("140");
    const [heightFt, setHeightFt] = useState(5);
    const [heightIn, setHeightIn] = useState(6);

    const { bmi, goalBmi, canLose } = useMemo(() => {
        const wNum = parseFloat(weight || "0");
        const gNum = parseFloat(goalWeight || "0");
        const m = ftInToMeters(heightFt, heightIn);

        const kgCurrent = unit === "kg" ? wNum : lbToKg(wNum);
        const kgGoal = unit === "kg" ? gNum : lbToKg(gNum);

        const bmiCurrent = m > 0 ? kgCurrent / (m * m) : 0;
        const bmiGoal = m > 0 ? kgGoal / (m * m) : 0;

        const diffKg = Math.max(0, kgCurrent - kgGoal);

        return {
            bmi: bmiCurrent,
            goalBmi: bmiGoal,
            canLose: unit === "kg" ? diffKg : kgToLb(diffKg),
        };
    }, [unit, weight, goalWeight, heightFt, heightIn]);

    const toggleUnit = () => {
        if (unit === "lbs") {
            setWeight(prev => String(Math.round(lbToKg(parseFloat(prev || "0")))));
            setGoalWeight(prev => String(Math.round(lbToKg(parseFloat(prev || "0")))));
            setUnit("kg");
        } else {
            setWeight(prev => String(Math.round(kgToLb(parseFloat(prev || "0")))));
            setGoalWeight(prev => String(Math.round(kgToLb(parseFloat(prev || "0")))));
            setUnit("lbs");
        }
    };


    return (
        <section
            className="relative isolate overflow-hidden bg-[#fffaf6] pt-14 text-center p-2"
           
        >
            <h2 className="mx-auto max-w-4xl text-3xl font-bold sm:text-4xl font-SofiaSans text-darkprimary">
                See how much weight you could lose —
                <br className="hidden sm:inline" />
                how different life could feel.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-darkprimary/80 font-SofiaSans">
                Backed by real medicine and real results, somi helps you reach your goals without constant
                hunger or unsustainable plans. Just choose your starting point to see what’s possible.
            </p>
            <div className="flex items-center justify-center">
                <div className="relative w-full max-w-lg z-10 hidden lg:block sm:hidden">
                    <Image
                        src="/hero/bmilady.png"
                        alt="BMI Calculator"
                        width={500}
                        height={500}
                        className="mx-auto bottom-0"
                    />
                </div>
                <div className="relative z-10 mx-auto mt-10 w-full max-w-4xl rounded-xl bg-lightprimary p-6 shadow-md ring-1 ring-black/10 backdrop-blur-md">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* current weight */}
                        <div>
                            <label className="mb-1 block text-sm text-left font-semibold text-gray-700">Your weight</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    step="1"
                                    inputMode="numeric"
                                    value={weight}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === "") { setWeight(""); return; }           // allow clearing
                                        const n = Number(v);
                                        if (Number.isNaN(n)) return;                       // ignore bad chars
                                        setWeight(String(Math.max(0, n)));                 // clamp to 0+, no auto-1
                                    }}
                                    onBlur={() => { if (weight === "") setWeight("0"); }}// normalize empty on blur
                                    className="w-28 rounded-lg border px-3 py-2 text-center text-lg font-semibold sm:w-32"
                                />
                                <button
                                    onClick={toggleUnit}
                                    className="rounded-lg border bg-secondary px-3 py-2 text-sm font-medium text-white"
                                >
                                    {unit.toUpperCase()}
                                </button>
                            </div>
                        </div>

                        {/* goal weight (same unit) */}
                        <div>
                            <label className="mb-1 block text-sm text-left font-semibold text-gray-700">Goal weight</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    step="1"
                                    inputMode="numeric"
                                    value={goalWeight}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === "") { setGoalWeight(""); return; }
                                        const n = Number(v);
                                        if (Number.isNaN(n)) return;
                                        setGoalWeight(String(Math.max(0, n)));
                                    }}
                                    onBlur={() => { if (goalWeight === "") setGoalWeight("0"); }}
                                    className="w-28 rounded-lg border px-3 py-2 text-center text-lg font-semibold sm:w-32"
                                />
                                <span className="text-sm font-semibold text-gray-600">{unit.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* height */}
                        <div className="md:col-span-2 text-left">
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Your height</label>
                            <HeightPicker
                                feet={heightFt}
                                inches={heightIn}
                                onFeet={setHeightFt}
                                onInches={setHeightIn}
                            />
                        </div>
                    </div>

                    {/* results */}
                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        <ResultCard
                            title="Your BMI"
                            value={bmi.toFixed(1)}
                            help="Body-mass index"
                            color="bg-white border-t-8 border-secondary"
                        />
                        <ResultCard
                            title="Goal BMI"
                            value={goalBmi.toFixed(1)}
                            help="From your goal weight"
                            color="bg-white border-t-8 border-emerald-700"
                        />
                        <ResultCard
                            title="You could lose up to"
                            value={Math.max(0, +canLose.toFixed(0))}
                            unit={unit}
                            help="Current − Goal"
                            color="bg-white border-t-8 border-secondary/80"
                        />
                    </div>

                </div>

            </div>
        </section>
    );
}
