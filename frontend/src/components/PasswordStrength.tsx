"use client";

import React, { useMemo } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const rules = useMemo(() => [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const score = rules.filter((r) => r.valid).length;
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];
  
  const currentStrength = score > 0 ? strengthLabels[score - 1] : "";
  const currentColor = score > 0 ? colors[score - 1] : "bg-slate-200";

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 font-medium">Password Strength</span>
        {currentStrength && (
          <span className={`font-semibold ${currentColor.replace("bg-", "text-")}`}>
            {currentStrength}
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
        <div 
          className={`h-full transition-all duration-300 ${currentColor}`} 
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center text-xs text-slate-600">
            {rule.valid ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-300 mr-2" />
            )}
            {rule.label}
          </div>
        ))}
      </div>
    </div>
  );
}
