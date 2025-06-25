"use client";

import React, { useState, memo, useRef, useCallback, KeyboardEvent, useEffect, ReactNode } from 'react';
import { FileText, Image as ImageIcon, X, UploadCloud, ArrowLeft, User, Briefcase, Lock, Mail, Phone, Fingerprint, Banknote, Landmark, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { useSession, signIn } from 'next-auth/react';

// =================================================================================
// 1. ADVANCED SUB-COMPONENTS
// =================================================================================

const FieldWrapper = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;

const InputWithIcon = ({ icon, ...props }: { icon: ReactNode } & React.ComponentProps<typeof Input>) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>
    <Input {...props} className="pl-10" />
  </div>
);

const FileUploader = memo(({ name, label, file, onChange, onRemove, accept, isRequired = false, isImage = false }: any) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(e);
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      }
    }
  };
  const clearFile = () => { onRemove(name); setPreview(null); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="space-y-2">
      <label className="font-medium text-sm">{label} {isRequired && <span className="text-red-500">*</span>}</label>
      {file ? (
        <div className="flex items-start gap-3 rounded-md border p-2.5">
          {isImage && preview ? <Image src={preview} alt="Preview" width={56} height={56} className="h-14 w-14 rounded-md object-cover" /> : <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-muted"><FileText className="h-6 w-6" /></div>}
          <div className="flex-grow overflow-hidden"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p></div>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={clearFile}><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/50">
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
      {value.map(tag => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2"><span className="font-normal">{tag}</span><button onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20"><X className="h-3 w-3" /></button></Badge>
      ))}
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-grow bg-transparent text-sm focus:outline-none p-1" />
    </div>
  );
});
TagInput.displayName = 'TagInput';

// =================================================================================
// 2. AUTHENTICATION & SUCCESS STATE COMPONENTS
// =================================================================================

// --- Simulated Auth Hook ---
const useAuth = () => {
  const { data: session, status } = useSession();
  return {
    user: session?.user ?? null,
    loading: status === 'loading',
    login: () => signIn(),
  };
};

const AuthGuard = ({ children, auth }: { children: ReactNode, auth: ReturnType<typeof useAuth> }) => {
  if (auth.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Verifying your session...</h2>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }
  if (!auth.user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>First log in to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p>You must be logged in to submit an application.</p>
          <Button onClick={auth.login}><LogIn className="mr-2 h-4 w-4" /> Sign In</Button>
        </CardContent>
      </Card>
    );
  }
  return <>{children}</>;
};

const SubmissionSuccess = ({ onReset }: { onReset: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center text-center py-16">
    <CheckCircle2 className="h-24 w-24 text-green-500 mb-6" />
    <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
    <p className="max-w-md text-muted-foreground mb-8">Thank you for your submission. Our team will review your credentials and get back to you within 3-5 business days. You will receive an email confirmation shortly.</p>
    <Button onClick={onReset}>Submit Another Application</Button>
  </motion.div>
);

// =================================================================================
// 3. MAIN PAGE COMPONENT
// =================================================================================

const initialState = {
  medicalCouncilRegistrationNumber: '', mbbsCertificate: null as File | null, pgDegree: null as File | null, superSpecialtyDegree: null as File | null, governmentId: null as File | null, professionalHeadshot: null as File | null,
  fullName: '', primarySpecialty: '', yearsOfExperience: '', clinicAddress: '', consultationTimings: '', consultationFees: '', professionalBio: '',
  servicesOffered: [] as string[], languagesSpoken: [] as string[],
  professionalEmail: '', privateContactNumber: '', panNumber: '', bankAccountNumber: '', ifscCode: '', agreedToTerms: false,
};

export default function JoinUsPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialState);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const steps = [{ id: 1, name: 'Verification', icon: <User /> }, { id: 2, name: 'Profile Details', icon: <Briefcase /> }, { id: 3, name: 'Admin & Financials', icon: <Lock /> }];
  const progress = ((currentStep) / (steps.length)) * 100;

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
        toast({ title: "Agreement Required", description: "You must agree to the Terms of Service.", variant: "destructive" });
        setSubmissionStatus('idle'); return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmissionStatus('success');
  };

  const handleReset = () => {
    setFormData(initialState);
    setCurrentStep(1);
    setSubmissionStatus('idle');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8"><h1 className="text-4xl font-extrabold tracking-tight">Doctor Onboarding</h1><p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Join our network of trusted healthcare professionals.</p></div>
        <AuthGuard auth={auth}>
            {submissionStatus === 'success' ? (
                <SubmissionSuccess onReset={handleReset} />
            ) : (
                <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex justify-between items-center mb-4"><CardTitle className="text-2xl flex items-center gap-2">{steps[currentStep - 1].icon} {steps[currentStep - 1].name}</CardTitle><span className="text-sm font-medium text-muted-foreground">Step {currentStep} of {steps.length}</span></div>
                    <Progress value={progress} className="w-full" />
                </CardHeader>
                <CardContent className="mt-6">
                    <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                            {currentStep === 1 && <Step1Verification data={formData} handlers={handlers} />}
                            {currentStep === 2 && <Step2Profile data={formData} handlers={handlers} />}
                            {currentStep === 3 && <Step3Admin data={formData} handlers={handlers} />}
                        </motion.div>
                    </AnimatePresence>
                    <div className="mt-10 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep} className={currentStep === 1 ? 'invisible' : 'visible'}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button type="submit" className="min-w-[120px]" disabled={submissionStatus === 'submitting'}>{currentStep === steps.length ? (submissionStatus === 'submitting' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Application') : 'Next Step'}</Button>
                    </div>
                    </form>
                </CardContent>
                </Card>
            )}
        </AuthGuard>
      </main>
      <Footer />
    </div>
  );
}

// --- Memoized Step Components ---
const Step1Verification = memo(({ data, handlers }: any) => (
  <div className="space-y-6">
    <FieldWrapper><label className="font-medium text-sm">Medical Council Reg. Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} id="medicalCouncilRegistrationNumber" name="medicalCouncilRegistrationNumber" value={data.medicalCouncilRegistrationNumber} onChange={handlers.handleChange} required /></FieldWrapper>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FileUploader name="mbbsCertificate" label="MBBS Certificate" file={data.mbbsCertificate} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired />
      <FileUploader name="pgDegree" label="Post-Graduate Degree" file={data.pgDegree} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired />
      <FileUploader name="superSpecialtyDegree" label="Super-Specialty Degree" file={data.superSpecialtyDegree} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" />
      <FileUploader name="governmentId" label="Government ID" file={data.governmentId} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept=".pdf,.jpg,.png" isRequired />
      <FileUploader name="professionalHeadshot" label="Professional Headshot" file={data.professionalHeadshot} onChange={handlers.handleFileChange} onRemove={handlers.removeFile} accept="image/*" isRequired isImage />
    </div>
  </div>
));
Step1Verification.displayName = 'Step1Verification';

const Step2Profile = memo(({ data, handlers }: any) => (
  <div className="space-y-6">
    <FieldWrapper><label className="font-medium text-sm">Full Name <span className="text-red-500">*</span></label><InputWithIcon icon={<User className="h-4 w-4 text-muted-foreground" />} id="fullName" name="fullName" value={data.fullName} onChange={handlers.handleChange} required /></FieldWrapper>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Primary Specialty <span className="text-red-500">*</span></label><Input id="primarySpecialty" name="primarySpecialty" placeholder="e.g., Cardiologist" value={data.primarySpecialty} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Years of Experience <span className="text-red-500">*</span></label><Input id="yearsOfExperience" name="yearsOfExperience" type="number" value={data.yearsOfExperience} onChange={handlers.handleChange} required /></FieldWrapper></div>
    <FieldWrapper><label className="font-medium text-sm">Clinic/Hospital & Address <span className="text-red-500">*</span></label><Textarea id="clinicAddress" name="clinicAddress" value={data.clinicAddress} onChange={handlers.handleChange} required /></FieldWrapper>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Consultation Timings <span className="text-red-500">*</span></label><Input id="consultationTimings" name="consultationTimings" placeholder="e.g., Mon-Fri, 10am-5pm" value={data.consultationTimings} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Consultation Fees (INR) <span className="text-red-500">*</span></label><Input id="consultationFees" name="consultationFees" type="number" value={data.consultationFees} onChange={handlers.handleChange} required /></FieldWrapper></div>
    <FieldWrapper><label className="font-medium text-sm">Services Offered <span className="text-red-500">*</span></label><TagInput value={data.servicesOffered} onChange={handlers.handleTagChange('servicesOffered')} placeholder="Type & press Enter..." /></FieldWrapper>
    <FieldWrapper><label className="font-medium text-sm">Languages Spoken <span className="text-red-500">*</span></label><TagInput value={data.languagesSpoken} onChange={handlers.handleTagChange('languagesSpoken')} placeholder="Type & press Enter..." /></FieldWrapper>
    <FieldWrapper><label className="font-medium text-sm">Professional Biography <span className="text-red-500">*</span></label><Textarea id="professionalBio" name="professionalBio" value={data.professionalBio} onChange={handlers.handleChange} required rows={4} placeholder="Briefly describe your expertise..." /></FieldWrapper>
  </div>
));
Step2Profile.displayName = 'Step2Profile';

const Step3Admin = memo(({ data, handlers }: any) => (
  <div className="space-y-6">
    <Alert><AlertTitle className="flex items-center gap-2"><Lock className="h-4 w-4" />Confidential Information</AlertTitle><AlertDescription>This information is used for administrative and payment purposes only and will not be shared publicly.</AlertDescription></Alert>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Professional Email <span className="text-red-500">*</span></label><InputWithIcon icon={<Mail className="h-4 w-4 text-muted-foreground" />} id="professionalEmail" name="professionalEmail" type="email" value={data.professionalEmail} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">Private Contact <span className="text-red-500">*</span></label><InputWithIcon icon={<Phone className="h-4 w-4 text-muted-foreground" />} id="privateContactNumber" name="privateContactNumber" type="tel" value={data.privateContactNumber} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">PAN Card Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} id="panNumber" name="panNumber" value={data.panNumber} onChange={handlers.handleChange} required /></FieldWrapper></div>
    <Card className="bg-slate-50 dark:bg-slate-800/50"><CardHeader><CardTitle className="text-base">Bank Details</CardTitle><CardDescription className="text-sm">Required for processing payouts.</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"><FieldWrapper><label className="font-medium text-sm">Bank Account Number <span className="text-red-500">*</span></label><InputWithIcon icon={<Banknote className="h-4 w-4 text-muted-foreground" />} id="bankAccountNumber" name="bankAccountNumber" value={data.bankAccountNumber} onChange={handlers.handleChange} required /></FieldWrapper><FieldWrapper><label className="font-medium text-sm">IFSC Code <span className="text-red-500">*</span></label><InputWithIcon icon={<Landmark className="h-4 w-4 text-muted-foreground" />} id="ifscCode" name="ifscCode" value={data.ifscCode} onChange={handlers.handleChange} required /></FieldWrapper></CardContent></Card>
    <div className="flex items-start space-x-3 pt-4"><Checkbox id="terms" checked={data.agreedToTerms} onCheckedChange={handlers.handleCheckboxChange} className="mt-1" /><div className="grid gap-1.5 leading-none"><label htmlFor="terms" className="font-medium text-sm">I agree to the Terms of Service and confirm all information is accurate.</label><p className="text-sm text-muted-foreground">You must agree to our terms before submitting.</p></div></div>
  </div>
));
Step3Admin.displayName = 'Step3Admin';