"use client";

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
    const [weight, setWeight] = useState(153);
    const [goalWeight, setGoalWeight] = useState(140); // NEW
    const [heightFt, setHeightFt] = useState(5);
    const [heightIn, setHeightIn] = useState(6);

    const { bmi, goalBmi, canLose } = useMemo(() => {
        const kgCurrent = unit === "kg" ? weight : lbToKg(weight);
        const kgGoal = unit === "kg" ? goalWeight : lbToKg(goalWeight);
        const m = ftInToMeters(heightFt, heightIn);

        const bmiCurrent = kgCurrent / (m * m);
        const bmiGoal = kgGoal / (m * m);

        const diffKg = Math.max(0, kgCurrent - kgGoal);

        return {
            bmi: bmiCurrent,
            goalBmi: bmiGoal,
            canLose: unit === "kg" ? diffKg : kgToLb(diffKg),
        };
    }, [unit, weight, goalWeight, heightFt, heightIn]);

    const toggleUnit = () => {
        if (unit === "lbs") {
            setWeight(Math.round(lbToKg(weight)));
            setGoalWeight(Math.round(lbToKg(goalWeight)));
            setUnit("kg");
        } else {
            setWeight(Math.round(kgToLb(weight)));
            setGoalWeight(Math.round(kgToLb(goalWeight)));
            setUnit("lbs");
        }
    };

    return (
        <section
            className="relative isolate overflow-hidden bg-darkprimary/80 py-14 text-center watermark p-2"
            data-text="somi"
            style={{
                '--wm-size': '210px',
                '--wm-stroke-c': '#FFFFFF',
                '--wm-stroke-w': '2px',
                '--wm-fill': 'transparent',
                '--wm-font': '"Sofia Sans", ui-sans-serif',
                '--wm-weight': 700,
                '--wm-tracking': '0em',
                '--wm-opacity': 0.85,
                '--wm-left': '0rem',
                '--wm-rotate': '90deg',
            }}
        >
            <h2 className="mx-auto max-w-4xl text-3xl font-bold sm:text-4xl font-SofiaSans text-white">
                See how much weight you could lose —
                <br className="hidden sm:inline" />
                how different life could feel.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-white/80 font-SofiaSans">
                Backed by real medicine and real results, somi helps you reach your goals without constant
                hunger or unsustainable plans. Just choose your starting point to see what’s possible.
            </p>

            <div className="relative z-10 mx-auto mt-10 w-full max-w-4xl rounded-xl bg-white/60 p-6 shadow-md ring-1 ring-black/10 backdrop-blur-md">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* current weight */}
                    <div>
                        <label className="mb-1 block text-sm text-left font-semibold text-gray-700">Your weight</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min={1}
                                value={weight}
                                onChange={(e) => setWeight(Math.max(1, +e.target.value))}
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
                                min={1}
                                value={goalWeight}
                                onChange={(e) => setGoalWeight(Math.max(1, +e.target.value))}
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
            <div className="relative mx-auto mt-10 w-full max-w-4xl">
                {/* light glow */}
                <span
                    aria-hidden
                    className="
      pointer-events-none absolute
      bottom-2 right-[-7rem]
      h-40 w-40 sm:h-56 sm:w-56
      rounded-full
      bg-[radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,.18),transparent_70%)]
      blur-2xl opacity-90
      z-0
    "
                />
                <img
                    src="/hero/newsemaglutide.png"
                    alt=""
                    className="
      pointer-events-none absolute z-10
      bottom-0 -right-32
      w-28 sm:w-32 md:w-36
    "
                />
            </div>

        </section>
    );
}
