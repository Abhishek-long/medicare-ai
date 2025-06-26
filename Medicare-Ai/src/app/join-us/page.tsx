"use client";

import React, { useState, memo, useRef, useCallback, KeyboardEvent, useEffect, ReactNode } from 'react';
import { FileText, Image as ImageIcon, X, UploadCloud, ArrowLeft, ArrowRight, User, Briefcase, Lock, Mail, Phone, Fingerprint, Banknote, Landmark, Check, Loader2, LogIn } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { useSession, signIn } from 'next-auth/react';

// =================================================================================
// 1. ADVANCED SUB-COMPONENTS (Polished and Reusable)
// =================================================================================

const FieldWrapper = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;
const InputWithIcon = ({ icon, ...props }: { icon: ReactNode } & React.ComponentProps<typeof Input>) => (<div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div><Input {...props} className="pl-10" /></div>);

const FileUploader = memo(({ name, label, file, onChange, onRemove, accept, isRequired = false, isImage = false }: any) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(e);
      if (isImage) { const reader = new FileReader(); reader.onloadend = () => setPreview(reader.result as string); reader.readAsDataURL(selectedFile); }
    }
  };
  const clearFile = () => { onRemove(name); setPreview(null); if (inputRef.current) inputRef.current.value = ""; };
  return (
    <div className="space-y-2">
      <label className="font-medium text-sm">{label} {isRequired && <span className="text-red-500">*</span>}</label>
      {file ? (
        <div className="flex items-start gap-3 rounded-md border p-2.5 bg-muted/50">
          {isImage && preview ? <Image src={preview} alt="Preview" width={80} height={80} className="h-20 w-20 rounded-md object-cover" /> : <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-muted"><FileText className="h-8 w-8 text-muted-foreground" /></div>}
          <div className="flex-grow overflow-hidden"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p></div>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={clearFile}><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary">
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click or drag file</span></p><p className="text-xs text-muted-foreground">{accept}</p>
          <Input ref={inputRef} id={name} name={name} type="file" onChange={handleFileChange} accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      )}
    </div>
  );
});
FileUploader.displayName = 'FileUploader';

const TagInput = memo(({ value, onChange, placeholder }: { value: string[], onChange: (tags: string[]) => void, placeholder: string }) => {
  const [inputValue, setInputValue] = useState('');
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) onChange([...value, newTag]);
      setInputValue('');
    }
  };
  const removeTag = (tagToRemove: string) => onChange(value.filter(tag => tag !== tagToRemove));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input p-2 min-h-[40px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {value.map(tag => <Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5"><span className="font-normal">{tag}</span><button onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20 transition-colors"><X className="h-3.5 w-3.5" /></button></Badge>)}
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-grow bg-transparent text-sm focus:outline-none p-1" />
    </div>
  );
});
TagInput.displayName = 'TagInput';

// =================================================================================
// 2. WIZARD, AUTH & SUCCESS COMPONENTS
// =================================================================================

const WizardStepper = ({ steps, currentStep }: { steps: { id: number, name: string, icon: ReactNode }[], currentStep: number }) => (
    <nav className="flex items-center justify-center" aria-label="Progress">
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <li key={step.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300", currentStep > step.id ? "border-green-600 bg-green-600" : currentStep === step.id ? "border-primary scale-110" : "border-border")}>
                {currentStep > step.id ? <Check className="h-6 w-6 text-white" /> : <div className={cn("transition-colors", currentStep === step.id && "text-primary")}>{step.icon}</div>}
              </div>
              <p className={cn("text-xs mt-2 transition-colors", currentStep === step.id && "text-primary font-semibold")}>{step.name}</p>
            </div>
            {index < steps.length - 1 && <div className={cn("h-0.5 w-12 sm:w-24 mt-[-1.5rem] transition-all duration-300", currentStep > step.id + 1 ? "bg-green-600" : "bg-border")} />}
          </li>
        ))}
      </ol>
    </nav>
);
  
const AnimatedCheckmark = () => ( <motion.svg className="h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></motion.svg>);
const SubmissionSuccess = ({ onReset }: { onReset: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center text-center py-16">
    <AnimatedCheckmark />
    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-3xl font-bold mt-4 mb-2">Application Under Review</motion.h1>
    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="max-w-md text-muted-foreground mb-8">Thank you! Your credentials have been successfully submitted. We'll notify you via email once the verification process is complete.</motion.p>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}><Button onClick={onReset}>Go to Dashboard</Button></motion.div>
  </motion.div>
);

const AuthGuard = ({ children, onLogin }: { children: ReactNode, onLogin: () => void }) => {
    const { data: session, status } = useSession();
    if (status === 'loading') return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><h2 className="text-xl font-semibold">Verifying session...</h2></div>;
    if (status === 'unauthenticated') return <Card className="max-w-md mx-auto text-center"><CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader><CardContent><p className="mb-4">Please sign in to access the onboarding form.</p><Button onClick={onLogin}><LogIn className="mr-2 h-4 w-4" /> Sign In to Continue</Button></CardContent></Card>;
    return <>{children}</>;
};

// =================================================================================
// 3. MAIN PAGE COMPONENT
// =================================================================================

const initialState = { medicalCouncilRegistrationNumber: '', mbbsCertificate: null as File | null, pgDegree: null as File | null, superSpecialtyDegree: null as File | null, governmentId: null as File | null, professionalHeadshot: null as File | null, fullName: '', primarySpecialty: '', yearsOfExperience: '', clinicAddress: '', consultationTimings: '', consultationFees: '', professionalBio: '', servicesOffered: [] as string[], languagesSpoken: [] as string[], professionalEmail: '', privateContactNumber: '', panNumber: '', bankAccountNumber: '', ifscCode: '', agreedToTerms: false, };

export default function JoinUsPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialState);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    // --- NEW: Intelligent Pre-filling ---
    useEffect(() => {
        if (session?.user && !formData.fullName && !formData.professionalEmail) {
            setFormData(prev => ({
                ...prev,
                fullName: session.user.name || '',
                professionalEmail: session.user.email || '',
            }));
        }
    }, [session, formData.fullName, formData.professionalEmail]);
    
    const steps = [{ id: 1, name: 'Verification', icon: <Fingerprint/> }, { id: 2, name: 'Profile', icon: <User /> }, { id: 3, name: 'Financials', icon: <Briefcase /> }];
    
    const handlers = {
        handleChange: useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })), []),
        handleFileChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setFormData(prev => ({ ...prev, [e.target.name]: e.target.files![0] })), []),
        removeFile: useCallback((fieldName: keyof typeof formData) => setFormData(prev => ({ ...prev, [fieldName]: null })), []),
        handleTagChange: useCallback((fieldName: 'servicesOffered' | 'languagesSpoken') => (tags: string[]) => setFormData(prev => ({ ...prev, [fieldName]: tags })), []),
        handleCheckboxChange: useCallback((checked: boolean) => setFormData(prev => ({ ...prev, agreedToTerms: checked })), []),
    };

    const nextStep = () => setCurrentStep(prev => prev < steps.length ? prev + 1 : prev);
    const prevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (currentStep < steps.length) { nextStep(); return; }
        
        setSubmissionStatus('submitting');
        if (!formData.agreedToTerms) {
            toast({ title: "Agreement Required", description: "Please agree to the Terms of Service.", variant: "destructive" });
            setSubmissionStatus('idle'); return;
        }
        
        // --- NEW: Including User Info in Submission ---
        const submissionData = { ...formData, userEmail: session?.user?.email };
        console.log('Submitting Data:', submissionData);

        await new Promise(resolve => setTimeout(resolve, 2000));
        setSubmissionStatus('success');
    };

    const handleReset = () => { setFormData(initialState); setCurrentStep(1); setSubmissionStatus('idle'); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black dark:bg-dot-white/[0.2]">
            <Header />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <AuthGuard onLogin={() => signIn()}>
                    {submissionStatus === 'success' ? ( <SubmissionSuccess onReset={handleReset} /> ) : (
                        <>
                            <div className="text-center mb-12"><h1 className="text-4xl font-extrabold tracking-tight">Doctor Onboarding</h1><p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Join our network of trusted healthcare professionals.</p></div>
                            <WizardStepper steps={steps} currentStep={currentStep} />
                            <Card className="mt-12 overflow-hidden shadow-2xl shadow-slate-900/10">
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit}>
                                        <AnimatePresence mode="wait">
                                            <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ type: 'spring', stiffness: 350, damping: 35 }}>
                                                {currentStep === 1 && <Step1Verification data={formData} handlers={handlers} />}
                                                {currentStep === 2 && <Step2Profile data={formData} handlers={handlers} />}
                                                {currentStep === 3 && <Step3Admin data={formData} handlers={handlers} />}
                                            </motion.div>
                                        </AnimatePresence>
                                        <div className="mt-12 flex justify-between items-center">
                                            <Button type="button" variant="ghost" onClick={prevStep} className={cn(currentStep === 1 && 'invisible')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                            <Button type="submit" size="lg" disabled={submissionStatus === 'submitting'}>{currentStep === steps.length ? (submissionStatus === 'submitting' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : 'Submit Application') : <>Next Step <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </AuthGuard>
            </main>
            <Footer />
        </div>
    );
}

// --- Memoized Step Components (No functional changes, ensures performance) ---
const Step1Verification = memo(({ data, handlers }: any) => (
  <div className="space-y-6"><FieldWrapper><label className="font-medium text-sm">Medical Council Reg. Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} name="medicalCouncilRegistrationNumber" value={data.medicalCouncilRegistrationNumber} onChange={handlers.handleChange} required /></FieldWrapper><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FileUploader name="mbbsCertificate" label="MBBS Certificate" file={data.mbbsCertificate} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired /><FileUploader name="pgDegree" label="Post-Graduate Degree" file={data.pgDegree} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired /><FileUploader name="superSpecialtyDegree" label="Super-Specialty Degree" file={data.superSpecialtyDegree} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" /><FileUploader name="governmentId" label="Government ID" file={data.governmentId} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired /><FileUploader name="professionalHeadshot" label="Professional Headshot" file={data.professionalHeadshot} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept="image/*" isRequired isImage /></div></div>
));
Step1Verification.displayName = 'Step1Verification';
const Step2Profile = memo(({ data, handlers }: any) => (
  <div className="space-y-6"><FieldWrapper><label className="font-medium text-sm">Full Name <span className="text-red-500">*</span></label><InputWithIcon icon={<User className="h-4 w-4 text-muted-foreground" />} name="fullName" value={data.fullName} onChange={handlers.handleChange} required /></FieldWrapper><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Primary Specialty <span className="text-red-500">*</span></label><Input name="primarySpecialty" placeholder="e.g., Cardiologist" value={data.primarySpecialty} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Years of Experience <span className="text-red-500">*</span></label><Input name="yearsOfExperience" type="number" value={data.yearsOfExperience} onChange={handlers.handleChange} required /></FieldWrapper></div><FieldWrapper><label className="font-medium text-sm">Clinic/Hospital & Address <span className="text-red-500">*</span></label><Textarea name="clinicAddress" value={data.clinicAddress} onChange={handlers.handleChange} required /></FieldWrapper><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Consultation Timings <span className="text-red-500">*</span></label><Input name="consultationTimings" placeholder="e.g., Mon-Fri, 10am-5pm" value={data.consultationTimings} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Consultation Fees (INR) <span className="text-red-500">*</span></label><Input name="consultationFees" type="number" value={data.consultationFees} onChange={handlers.handleChange} required /></FieldWrapper></div><FieldWrapper><label className="font-medium text-sm">Services Offered <span className="text-red-500">*</span></label><TagInput value={data.servicesOffered} onChange={handlers.handleTagChange('servicesOffered')} placeholder="Type & press Enter..." /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Languages Spoken <span className="text-red-500">*</span></label><TagInput value={data.languagesSpoken} onChange={handlers.handleTagChange('languagesSpoken')} placeholder="Type & press Enter..." /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Professional Biography <span className="text-red-500">*</span></label><Textarea name="professionalBio" value={data.professionalBio} onChange={handlers.handleChange} required rows={4} placeholder="Briefly describe your expertise..." /></FieldWrapper></div>
));
Step2Profile.displayName = 'Step2Profile';
const Step3Admin = memo(({ data, handlers }: any) => (
  <div className="space-y-6"><Alert><AlertTitle className="flex items-center gap-2"><Lock className="h-4 w-4" />Confidential Information</AlertTitle><AlertDescription>This information is used for administrative purposes only and will not be shared publicly.</AlertDescription></Alert><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Professional Email <span className="text-red-500">*</span></label><InputWithIcon icon={<Mail className="h-4 w-4 text-muted-foreground" />} name="professionalEmail" type="email" value={data.professionalEmail} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Private Contact <span className="text-red-500">*</span></label><InputWithIcon icon={<Phone className="h-4 w-4 text-muted-foreground" />} name="privateContactNumber" type="tel" value={data.privateContactNumber} onChange={handlers.handleChange} required /></FieldWrapper></div><Card className="bg-slate-50 dark:bg-slate-800/50"><CardHeader><CardTitle className="text-base">Financial Details</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Bank Account Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Banknote className="h-4 w-4 text-muted-foreground" />} name="bankAccountNumber" value={data.bankAccountNumber} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">IFSC Code <span className="text-red-500">*</span></label><InputWithIcon icon={<Landmark className="h-4 w-4 text-muted-foreground" />} name="ifscCode" value={data.ifscCode} onChange={handlers.handleChange} required /></FieldWrapper></div><FieldWrapper><label className="font-medium text-sm">PAN Card Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} name="panNumber" value={data.panNumber} onChange={handlers.handleChange} required /></FieldWrapper></CardContent></Card><div className="flex items-start space-x-3 pt-4"><Checkbox id="terms" checked={data.agreedToTerms} onCheckedChange={handlers.handleCheckboxChange} className="mt-1" /><div className="grid gap-1.5 leading-none"><label htmlFor="terms" className="font-medium text-sm">I agree to the Terms of Service and confirm all information is accurate.</label></div></div></div>
));
Step3Admin.displayName = 'Step3Admin';