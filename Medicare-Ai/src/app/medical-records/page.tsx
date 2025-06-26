"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileText, Download, Upload, Calendar, User, DollarSign, Plus, Search, Filter, Stethoscope, FlaskConical, Pill, FilePlus2, ChevronRight, X, FileImage, FileJson, TrendingUp, ShieldCheck, FileType, Image as ImageIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from "sonner";

// =================================================================================
// DATA (Initial Mock Data)
// =================================================================================

const initialMedicalHistory = [
    { id: 1, date: "2024-01-15", type: "Consultation", doctor: "Dr. Sarah Johnson", diagnosis: "Annual Physical Exam", notes: "Patient in excellent health. All vitals are stable. Discussed preventive care for the upcoming year.", status: "Completed" },
    { id: 2, date: "2023-12-08", type: "Lab Results", doctor: "Dr. Michael Chen", diagnosis: "Blood Panel", notes: "All values within normal range. Cholesterol levels have improved since last check.", status: "Reviewed" },
];

const initialBills = [
    { id: 1, date: "2024-01-15", provider: "City General Hospital", service: "Annual Exam", amount: 250.00, status: "Paid" },
    { id: 4, date: "2024-02-05", provider: "PharmaCare Plus", service: "Prescription Refill", amount: 36.50, status: "Outstanding" },
];

const initialDocuments = [
    { id: 1, name: "Annual_Report_2024.pdf", type: "PDF Document", date: "2024-01-15", size: "2.4 MB", icon: FileText },
    { id: 2, name: "Specialist_Referral.docx", type: "Word Document", date: "2023-11-22", size: "0.1 MB", icon: FileType },
];

const spendingData = [
    { month: "Dec '23", spending: 180 }, { month: "Jan '24", spending: 250 }, { month: "Feb '24", spending: 36.50 },
];

// =================================================================================
// HELPER COMPONENTS & UTILS
// =================================================================================

const getStatusBadge = (status: string) => {
    const styleMap: { [key: string]: string } = {
        "Completed": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700",
        "Paid": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700",
        "Active": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
        "Outstanding": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700",
        "Reviewed": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    };
    return <Badge variant="outline" className={`font-medium ${styleMap[status] || "bg-gray-100 text-gray-800"}`}>{status}</Badge>;
};

const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        "Consultation": <Stethoscope className="w-5 h-5 text-blue-500" />,
        "Lab Results": <FlaskConical className="w-5 h-5 text-purple-500" />,
        "Prescription": <Pill className="w-5 h-5 text-green-500" />,
        "Procedure": <FilePlus2 className="w-5 h-5 text-orange-500" />
    };
    return <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-8 ring-slate-50 dark:bg-slate-800 dark:ring-slate-950">{iconMap[type] || <FileText className="w-5 h-5 text-gray-500" />}</div>;
};

// ENHANCEMENT: Refined file type helpers
const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'PDF Document';
    if (extension === 'docx') return 'Word Document';
    return 'Document';
};

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return FileText;
    if (extension === 'docx') return FileType;
    return FileJson; // Fallback
};

const MotionCard = motion(Card);
const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_FILE_EXTENSIONS = ".pdf,.docx";


// =================================================================================
// MAIN PAGE COMPONENT
// =================================================================================

const MedicalRecordsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("history");
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    
    const [documents, setDocuments] = useState(initialDocuments);
    const [medicalHistory, setMedicalHistory] = useState(initialMedicalHistory);
    const [bills, setBills] = useState(initialBills);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!lowercasedFilter) {
            return { medicalHistory, bills, documents };
        }
        return {
            medicalHistory: medicalHistory.filter(r => r.diagnosis.toLowerCase().includes(lowercasedFilter) || r.doctor.toLowerCase().includes(lowercasedFilter)),
            bills: bills.filter(b => b.service.toLowerCase().includes(lowercasedFilter) || b.provider.toLowerCase().includes(lowercasedFilter)),
            documents: documents.filter(d => d.name.toLowerCase().includes(lowercasedFilter) || d.type.toLowerCase().includes(lowercasedFilter)),
        };
    }, [searchTerm, medicalHistory, bills, documents]);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };
    
    // ENHANCEMENT: File validation logic
    const validateFile = (file: File): boolean => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error("Invalid file type. Please upload a PDF or DOCX file.");
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (validateFile(e.target.files[0])) {
                setSelectedFile(e.target.files[0]);
            }
        }
    };

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (validateFile(e.dataTransfer.files[0])) {
                setSelectedFile(e.dataTransfer.files[0]);
            }
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            toast.error("Please select a file to upload.");
            return;
        }

        const newDocument = {
            id: Date.now(),
            name: selectedFile.name,
            type: getFileType(selectedFile.name),
            date: new Date().toLocaleDateString('en-CA'),
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            icon: getFileIcon(selectedFile.name)
        };

        setDocuments(prevDocs => [newDocument, ...prevDocs]);
        toast.success("Document uploaded successfully!");
        
        setSelectedFile(null);
        setUploadModalOpen(false);
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="absolute top-0 left-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
              <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
            </div>

            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Health Dashboard</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Welcome back, Alex. Here is your complete, secure overview.</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { title: "Next Appointment", value: "Feb 28, 2025", desc: "Dr. Sarah Johnson", icon: Calendar, color: "text-blue-500" },
                        { title: "Outstanding Bills", value: "$36.50", desc: "1 item needs attention", icon: DollarSign, color: "text-red-500" },
                        { title: "Active Prescriptions", value: "1", desc: "Sumatriptan 50mg", icon: Pill, color: "text-green-500" },
                        { title: "Insurance Status", value: "Active", desc: "United Health Plan", icon: ShieldCheck, color: "text-indigo-500" },
                    ].map((item, i) => (
                        <MotionCard
                            key={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeInOut' }}
                            whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                            className="bg-background/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                                <p className="text-xs text-muted-foreground pt-1">{item.desc}</p>
                            </CardContent>
                        </MotionCard>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                         <Card className="shadow-xl bg-background/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 rounded-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="h-10 rounded-full"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                                        <Button className="h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:text-white" onClick={() => setUploadModalOpen(true)}><Upload className="w-4 h-4 mr-2" /> Upload</Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <TabsTrigger value="history" className="rounded-full">History</TabsTrigger>
                                        <TabsTrigger value="bills" className="rounded-full">Bills</TabsTrigger>
                                        <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
                                    </TabsList>
                                    <AnimatePresence mode="wait">
                                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                            <TabsContent value="history" className="mt-6 relative"><div className="absolute left-6 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div><div className="space-y-12">{filteredData.medicalHistory.map((record, i) => (<motion.div key={record.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="relative pl-20">{getTypeIcon(record.type)}<div className="flex justify-between items-start"><div><p className="font-bold text-base text-slate-800 dark:text-slate-100">{record.diagnosis}</p><p className="text-sm text-muted-foreground">{record.doctor}</p></div><p className="text-sm text-muted-foreground flex-shrink-0 ml-4">{record.date}</p></div><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{record.notes}</p><div className="mt-3">{getStatusBadge(record.status)}</div></motion.div>))}</div></TabsContent>
                                            <TabsContent value="bills" className="mt-6 space-y-4">{filteredData.bills.map((bill, i) => (<motion.div key={bill.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}><div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"><div className="flex items-center gap-4"><div className={`p-3 rounded-full ${bill.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}><DollarSign className={`w-5 h-5 ${bill.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}/></div><div><p className="font-semibold">{bill.service}</p><p className="text-sm text-muted-foreground">{bill.provider} - {bill.date}</p></div></div><div className="text-right"><p className="font-bold text-lg">${bill.amount.toFixed(2)}</p>{getStatusBadge(bill.status)}{bill.status === 'Outstanding' && <Button size="sm" variant="link" className="h-auto p-0 mt-1 text-blue-600">Pay Now</Button>}</div></div></motion.div>))}</TabsContent>
                                            <TabsContent value="documents" className="mt-6"><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{filteredData.documents.map((doc, i) => (<motion.div key={doc.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><Card className="group transition-all hover:shadow-lg hover:-translate-y-1"><CardContent className="p-4 flex flex-col items-center text-center"><div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3"><doc.icon className="w-8 h-8 text-blue-500" /></div><p className="font-semibold text-sm truncate w-full" title={doc.name}>{doc.name}</p><p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p><Button variant="ghost" size="sm" className="mt-3 w-full"><Download className="w-4 h-4 mr-2"/>Download</Button></CardContent></Card></motion.div>))}</div></TabsContent>
                                        </motion.div>
                                    </AnimatePresence>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <aside className="lg:col-span-4 space-y-8">
                        <MotionCard initial={{opacity:0, x: 20}} animate={{opacity: 1, x:0}} transition={{delay: 0.3}} className="shadow-lg bg-background/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary"/> Spending Overview</CardTitle><CardDescription>Your monthly health-related expenses.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={spendingData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} /><Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(200,200,200,0.5)', borderRadius: '0.5rem' }} /><Bar dataKey="spending" fill="hsl(220 100% 65%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></MotionCard>
                        <MotionCard initial={{opacity:0, x: 20}} animate={{opacity: 1, x:0}} transition={{delay: 0.4}} className="shadow-lg bg-background/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80"><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="space-y-3"><Button variant="outline" className="w-full justify-start gap-3"><FilePlus2 className="w-4 h-4 text-blue-500"/>Request a new record</Button><Button variant="outline" className="w-full justify-start gap-3"><Pill className="w-4 h-4 text-green-500"/>Refill a prescription</Button><Button variant="outline" className="w-full justify-start gap-3"><Calendar className="w-4 h-4 text-orange-500"/>Schedule an appointment</Button></CardContent></MotionCard>
                    </aside>
                </div>
            </main>
            <Footer />

            <Dialog open={isUploadModalOpen} onOpenChange={(isOpen) => { setUploadModalOpen(isOpen); if (!isOpen) setSelectedFile(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload a New Document</DialogTitle>
                  <DialogDescription>Only PDF and DOCX files are accepted.</DialogDescription>
                </DialogHeader>
                <div className="my-4 flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
                        {selectedFile ? (
                            <div className="text-center">
                                <FileText className="w-12 h-12 mx-auto text-green-500"/>
                                <p className="font-semibold mt-2">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                <Button variant="link" size="sm" className="text-red-500 h-auto p-0 mt-2" onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}>Clear</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 10MB)</p>
                            </div>
                        )}
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept={ALLOWED_FILE_EXTENSIONS} />
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!selectedFile}>
                        <Upload className="w-4 h-4 mr-2"/>Upload File
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
    );
};

export default MedicalRecordsPage;