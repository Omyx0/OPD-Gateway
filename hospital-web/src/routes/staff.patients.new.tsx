import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Edit3, ShieldCheck, UploadCloud, Info, Paperclip, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/state/staff-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/patients/new")({
  head: () => ({
    meta: [{ title: "New Patient Registration — Smart OPD Staff" }],
  }),
  component: NewPatientPage,
});

function NewPatientPage() {
  const navigate = useNavigate();
  const { user } = useStaffAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    patientCode: "",
    fullName: "",
    dob: "",
    sex: "",
    phone: "",
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`
      };
      
      // Map form sex value to backend enum
      const genderMap: Record<string, string> = { m: "MALE", f: "FEMALE", o: "OTHER" };
      
      // 1. Create Patient
      const patientRes = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fullName: formData.fullName || "Unknown",
          dateOfBirth: formData.dob || undefined,
          gender: genderMap[formData.sex] || "OTHER",
          mobile: formData.phone || undefined,
        })
      });
      if (!patientRes.ok) {
        const err = await patientRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create patient");
      }
      const patientData = await patientRes.json();
      const patientId = patientData.data.id;

      // Fetch first department (fallback)
      const deptRes = await fetch(`${import.meta.env.VITE_API_URL}/departments`, { headers });
      const deptData = await deptRes.json();
      const deptId = deptData.data[0]?.id;

      // 2. Create Visit (this also auto-creates a queue ticket on the backend)
      const visitRes = await fetch(`${import.meta.env.VITE_API_URL}/visits`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          patientId,
          departmentId: deptId,
          visitType: "OPD",
          source: "RECEPTION"
        })
      });
      if (!visitRes.ok) {
        const err = await visitRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create visit");
      }
      
      return await visitRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Patient Registered & Queued", {
        description: "Visit created and queue ticket generated. Check the live queue."
      });
      navigate({ to: "/staff" });
    },
    onError: (err) => {
      toast.error("Registration Failed", {
        description: err.message
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wider font-geist">Step 1 of 3</p>
            <h2 className="text-3xl font-semibold mt-1 font-geist">Patient Details</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground font-geist">33%</span>
        </div>
        <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 w-1/3 rounded-full"></div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Instructions & Scan (Col Span 5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-6 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <ShieldCheck size={18} />
              IDENTITY VERIFICATION
            </h3>
            <p className="text-base text-foreground mb-6">
              For faster registration and accuracy, please scan the patient's state-issued ID or insurance card. Data will be extracted automatically.
            </p>
            
            {/* Scan Dropzone */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/50 hover:border-teal-500 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className="text-teal-600" />
              </div>
              <span className="text-base font-medium text-foreground">Click to upload or scan</span>
              <span className="text-xs font-medium text-muted-foreground mt-2 font-geist">Supports JPG, PNG, PDF</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-start gap-3">
                <Info className="text-teal-600 mt-0.5 shrink-0" size={20} />
                <p className="text-sm text-muted-foreground">
                  If scanning fails, please proceed with manual entry in the adjacent form.
                </p>
              </div>
            </div>
          </div>
          
          {/* Optional: Health Reports Upload */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-6 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Paperclip size={18} />
              PAST HEALTH REPORTS (OPTIONAL)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload recent prescriptions or lab results. AI model will analyze this to assist the doctor.
            </p>
            <Button variant="outline" className="w-full flex items-center gap-2 border-teal-200 text-teal-700 hover:bg-teal-50">
              <UploadCloud size={16} /> Select Files
            </Button>
          </div>
        </div>

        {/* Right Column: Manual Entry Form (Col Span 7) */}
        <div className="md:col-span-7 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-8 flex items-center gap-2">
            <Edit3 size={18} />
            MANUAL ENTRY
          </h3>
          <form className="max-w-[500px] flex flex-col gap-8" onSubmit={handleSubmit}>
            
            {/* PWA Link / Unique ID */}
            <div className="relative p-4 bg-teal-50/50 rounded-xl border border-teal-100">
              <label className="block text-xs font-bold text-teal-700 uppercase tracking-wider mb-1" htmlFor="patientCode">PWA Unique ID (Optional)</label>
              <div className="flex items-center gap-2">
                <Search className="text-teal-600" size={18} />
                <input 
                  className="w-full bg-transparent border-0 border-b border-teal-200 rounded-none px-0 py-1 text-base focus:ring-0 focus:border-teal-500 transition-all text-teal-900 placeholder:text-teal-300" 
                  id="patientCode" 
                  placeholder="e.g., P-10024" 
                  type="text"
                  value={formData.patientCode}
                  onChange={e => setFormData({...formData, patientCode: e.target.value})}
                />
              </div>
              <p className="text-xs text-teal-600 mt-2">Enter the ID if the patient uses the PWA to sync records and queue status.</p>
            </div>

            {/* Full Name */}
            <div className="relative">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1" htmlFor="fullName">Legal Full Name</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-2 text-lg focus:ring-0 focus:border-b-transparent focus:border focus:border-teal-500 focus:rounded-lg focus:px-3 transition-all" 
                id="fullName" 
                placeholder="e.g., Jane Doe" 
                required 
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            {/* DOB and Sex Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1" htmlFor="dob">Date of Birth</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-2 text-lg focus:ring-0 focus:border-b-transparent focus:border focus:border-teal-500 focus:rounded-lg focus:px-3 transition-all" 
                  id="dob" 
                  required 
                  type="date"
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1" htmlFor="sex">Biological Sex</label>
                <select 
                  className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-2 text-lg focus:ring-0 focus:border-b-transparent focus:border focus:border-teal-500 focus:rounded-lg focus:px-3 transition-all appearance-none" 
                  id="sex" 
                  required
                  value={formData.sex}
                  onChange={e => setFormData({...formData, sex: e.target.value})}
                >
                  <option disabled value="">Select</option>
                  <option value="f">Female</option>
                  <option value="m">Male</option>
                  <option value="o">Other</option>
                </select>
              </div>
            </div>

            {/* Contact */}
            <div className="relative">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1" htmlFor="phone">Primary Phone</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">+91</span>
                <input 
                  className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-2 text-lg focus:ring-0 focus:border-b-transparent focus:border focus:border-teal-500 focus:rounded-lg focus:px-3 transition-all" 
                  id="phone" 
                  placeholder="9876543210" 
                  required 
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-border/30">
              <Button type="button" variant="ghost" className="rounded-full px-6" onClick={() => navigate({ to: "/staff/patients" })}>
                Cancel
              </Button>
              <Button disabled={registerMutation.isPending} type="submit" className="rounded-full px-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
