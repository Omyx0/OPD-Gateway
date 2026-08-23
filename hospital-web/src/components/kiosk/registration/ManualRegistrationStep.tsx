import { useState, type ReactNode } from "react";
import { z } from "zod";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patientService } from "@/services";

const INSURANCE_PROVIDERS = patientService.listInsuranceProviders();
import { cn } from "@/lib/utils";
import type { Patient, RegistrationMethod } from "@/types/opd";

const NAME_RE = /^[\p{L}\p{M}.'\- ]+$/u;
const PHONE_RE = /^[0-9+\-\s()]{8,18}$/;

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter the full name (at least 2 characters)")
      .max(80, "Name must be less than 80 characters")
      .regex(NAME_RE, "Use letters only — no numbers or symbols"),
    dateOfBirth: z.string().trim().optional(),
    age: z
      .string()
      .trim()
      .min(1, "Enter a date of birth or an age")
      .refine((v) => Number(v) >= 0 && Number(v) <= 120, "Age must be between 0 and 120"),
    gender: z.enum(["Male", "Female", "Other"], { message: "Please select a gender" }),
    phone: z
      .string()
      .trim()
      .regex(PHONE_RE, "Enter a valid mobile number, for example +91 98200 41102"),
    address: z.string().trim().max(160, "Address must be less than 160 characters").optional(),
    insuranceProvider: z.string().trim().optional(),
    insuranceNumber: z
      .string()
      .trim()
      .max(40, "Policy number must be less than 40 characters")
      .optional(),
  })
  .refine(
    (v) =>
      !v.insuranceProvider ||
      v.insuranceProvider === INSURANCE_PROVIDERS[0] ||
      (v.insuranceNumber ?? "").length > 0,
    { path: ["insuranceNumber"], message: "Add the policy number for this insurer" },
  );

type FormValues = z.input<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

function ageFromDob(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
  return a >= 0 && a <= 120 ? String(a) : "";
}

export function ManualRegistrationStep({
  method,
  initial,
  onSubmit,
  onBack,
}: {
  method: RegistrationMethod;
  initial: Partial<Patient>;
  onSubmit: (patient: Partial<Patient>) => void;
  onBack: () => void;
}) {
  const walkIn = method === "WALK_IN";
  const [values, setValues] = useState<FormValues>({
    name: initial.name ?? "",
    dateOfBirth: initial.dateOfBirth ?? "",
    age: initial.age ? String(initial.age) : "",
    gender: initial.gender as FormValues["gender"],
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    insuranceProvider: initial.insuranceProvider ?? "",
    insuranceNumber: initial.insuranceNumber ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "dateOfBirth" && typeof value === "string" && value) {
        next.age = ageFromDob(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit() {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setTouched(Object.fromEntries(Object.keys(next).map((k) => [k, true])));
      const first = document.getElementById(String(parsed.error.issues[0]?.path[0]));
      first?.focus();
      return;
    }
    const v = parsed.data;
    onSubmit({
      name: v.name,
      age: Number(v.age),
      gender: v.gender,
      phone: v.phone,
      idNumber: initial.idNumber ?? "",
      ...(v.dateOfBirth ? { dateOfBirth: v.dateOfBirth } : {}),
      ...(v.address ? { address: v.address } : {}),
      ...(v.insuranceProvider ? { insuranceProvider: v.insuranceProvider } : {}),
      ...(v.insuranceNumber ? { insuranceNumber: v.insuranceNumber } : {}),
    });
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="kiosk-heading">{walkIn ? "Walk-in registration" : "Enter your details"}</h1>
      <p className="kiosk-sub mt-3 text-muted-foreground">
        {walkIn
          ? "We only need a name and a mobile number to add you to the queue."
          : "Fields marked with * are required. Nothing is sent anywhere — this is a demonstration."}
      </p>

      {errorCount > 0 ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-emergency/40 bg-emergency/5 p-4 text-emergency"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="font-medium">
            Please check {errorCount} {errorCount === 1 ? "field" : "fields"} highlighted below.
          </p>
        </div>
      ) : null}

      <Card className="mt-6 space-y-6 p-6">
        <Field id="name" label="Full name *" error={errors.name} hint="As printed on your ID card">
          <Input
            id="name"
            autoComplete="name"
            maxLength={80}
            className={inputCls(errors.name)}
            aria-invalid={Boolean(errors.name)}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => setTouched({ ...touched, name: true })}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="dateOfBirth"
            label="Date of birth"
            error={errors.dateOfBirth}
            hint="We fill in the age for you"
          >
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className={inputCls(errors.dateOfBirth)}
              value={values.dateOfBirth ?? ""}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field id="age" label="Age *" error={errors.age} hint="In years">
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              className={inputCls(errors.age)}
              aria-invalid={Boolean(errors.age)}
              value={values.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="gender" label="Gender *" error={errors.gender}>
            <Select
              value={values.gender ?? ""}
              onValueChange={(v) => set("gender", v as FormValues["gender"])}
            >
              <SelectTrigger
                id="gender"
                className={cn("h-14 text-lg", errors.gender && "border-emergency")}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="phone"
            label="Mobile number *"
            error={errors.phone}
            hint="For queue updates only"
          >
            <Input
              id="phone"
              inputMode="tel"
              autoComplete="tel"
              maxLength={18}
              placeholder="+91 98200 41102"
              className={inputCls(errors.phone)}
              aria-invalid={Boolean(errors.phone)}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
        </div>

        {!walkIn ? (
          <>
            <Field
              id="address"
              label="Address"
              error={errors.address}
              hint="Optional — helps us find your past visits"
            >
              <Textarea
                id="address"
                rows={2}
                maxLength={160}
                className={cn("text-lg", errors.address && "border-emergency")}
                value={values.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="insuranceProvider" label="Insurance" error={errors.insuranceProvider}>
                <Select
                  value={values.insuranceProvider ?? ""}
                  onValueChange={(v) => set("insuranceProvider", v)}
                >
                  <SelectTrigger id="insuranceProvider" className="h-14 text-lg">
                    <SelectValue placeholder="Select insurer" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="insuranceNumber" label="Policy number" error={errors.insuranceNumber}>
                <Input
                  id="insuranceNumber"
                  maxLength={40}
                  className={inputCls(errors.insuranceNumber)}
                  aria-invalid={Boolean(errors.insuranceNumber)}
                  value={values.insuranceNumber ?? ""}
                  onChange={(e) => set("insuranceNumber", e.target.value)}
                />
              </Field>
            </div>
          </>
        ) : null}
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="kioskLg" onClick={handleSubmit}>
          Review my details
          <ArrowRight aria-hidden />
        </Button>
        <Button variant="outline" size="kioskLg" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return cn("h-14 text-lg", error && "border-emergency focus-visible:ring-emergency/40");
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-2 text-sm font-medium text-emergency"
        >
          <AlertCircle className="size-4" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 opacity-50" aria-hidden />
          {hint}
        </p>
      ) : null}
    </div>
  );
}
