"use client";

import { useState, useMemo } from "react";

const B2B_SAVINGS_RATE = 0.18;
const PLATFORM_COST_MONTHLY = 49;
const PLATFORM_COST_ANNUAL = PLATFORM_COST_MONTHLY * 12;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function sliderProgress(value: number, min: number, max: number): string {
  return `${((value - min) / (max - min)) * 100}%`;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, unit, prefix, onChange }: SliderProps) {
  const progress = sliderProgress(value, min, max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-muted text-[13px]">{label}</label>
        <span className="text-[15px] font-semibold text-foreground tabular-nums">
          {prefix}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full"
        style={{ "--progress": progress } as React.CSSProperties}
      />
      <div className="flex justify-between text-[11px] text-muted/60">
        <span>
          {prefix}
          {min}
          {unit}
        </span>
        <span>
          {prefix}
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function ROICalculator() {
  const [groupsPerMonth, setGroupsPerMonth] = useState(10);
  const [avgGroupSize, setAvgGroupSize] = useState(25);
  const [spendPerPerson, setSpendPerPerson] = useState(35);

  const results = useMemo(() => {
    const monthlyRetail = groupsPerMonth * avgGroupSize * spendPerPerson;
    const monthlySavings = monthlyRetail * B2B_SAVINGS_RATE;
    const annualSavings = monthlySavings * 12;
    const netAnnualSavings = annualSavings - PLATFORM_COST_ANNUAL;
    const roiPercentage = (netAnnualSavings / PLATFORM_COST_ANNUAL) * 100;

    return {
      monthlyRetail,
      monthlySavings,
      annualSavings,
      netAnnualSavings,
      roiPercentage,
    };
  }, [groupsPerMonth, avgGroupSize, spendPerPerson]);

  return (
    <>
      {/* Slider styling */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(
            to right,
            #3B82F6 0%,
            #3B82F6 var(--progress),
            #e5e7eb var(--progress),
            #e5e7eb 100%
          );
          outline: none;
          transition: background 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
        }
      `}</style>

      <div className="rounded-2xl border border-card-border bg-card-bg p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">ROI Calculator</h3>
          <p className="text-muted text-[13px] mt-1">
            See how much your tour operation can save with TicketMatch B2B pricing.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Left — Sliders */}
          <div className="space-y-8">
            <Slider
              label="Groups per month"
              value={groupsPerMonth}
              min={1}
              max={50}
              step={1}
              onChange={setGroupsPerMonth}
            />
            <Slider
              label="Average group size"
              value={avgGroupSize}
              min={5}
              max={100}
              step={5}
              onChange={setAvgGroupSize}
            />
            <Slider
              label="Average spend per person (retail)"
              value={spendPerPerson}
              min={10}
              max={100}
              step={5}
              prefix="€"
              onChange={setSpendPerPerson}
            />
          </div>

          {/* Right — Results */}
          <div className="rounded-xl bg-gradient-to-br from-accent/5 to-blue-500/5 border border-accent/20 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Monthly bookings value */}
              <div>
                <p className="text-muted text-[13px]">Monthly bookings value</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(results.monthlyRetail)}
                </p>
              </div>

              {/* Monthly savings */}
              <div>
                <p className="text-muted text-[13px]">Estimated monthly savings</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(results.monthlySavings)}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-accent/10" />

              {/* Annual savings — hero number */}
              <div>
                <p className="text-muted text-[13px]">Annual savings</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(results.annualSavings)}
                </p>
              </div>

              {/* Platform cost */}
              <div className="flex items-center justify-between">
                <p className="text-muted text-[13px]">Platform cost (Growth plan)</p>
                <p className="text-[14px] font-medium text-foreground/70">
                  -{formatCurrency(PLATFORM_COST_ANNUAL)}/yr
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-accent/10" />

              {/* Net ROI */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-[13px]">Net ROI</p>
                  <p className="text-sm text-foreground/60">
                    Net savings: {formatCurrency(results.netAnnualSavings)}/yr
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-1.5 text-lg font-bold ${
                    results.roiPercentage > 0
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {results.roiPercentage > 0 ? "+" : ""}
                  {Math.round(results.roiPercentage)}%
                </span>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/request-access"
              className="mt-6 block w-full rounded-xl bg-accent px-6 py-3 text-center text-[14px] font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              Start saving now — Request Free Access
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
