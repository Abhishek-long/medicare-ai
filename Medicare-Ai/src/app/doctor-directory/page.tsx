"use client";

import { useState, ReactNode, useMemo, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Navigation, User, Heart, X, Settings2, Phone, Globe, LocateFixed, Calendar as CalendarIcon, Clock, CheckCircle, Hourglass, CalendarClock, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// =================================================================================
// 1. DATA, HOOKS & API LOGIC
// =================================================================================

interface Doctor { id: string; name: string; address: string; specialty: string; lat: number; lng: number; photo?: string; distance?: number; phone?: string; website?: string; }
interface Appointment { id: string; doctor: Doctor; patientName: string; patientContact: string; appointmentDate: string; reason: string; status: 'Pending' | 'Upcoming' | 'Completed'; }

const SPECIALTIES = [ "All Specialties", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology", "General Practice", "Dentist" ];

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } 
        catch (error) { console.error(error); return initialValue; }
    });
    const setValue = (value: T) => {
        try { setStoredValue(value); if (typeof window !== "undefined") { window.localStorage.setItem(key, JSON.stringify(value)); } } 
        catch (error) { console.error(error); }
    };
    return [storedValue, setValue];
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lng2 - lng1) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }
function mapCategoriesToSpecialty(categories: string[]): string { const specialtyMap: { [key: string]: string } = { 'healthcare.dentist': 'Dentist', 'healthcare.clinic_or_praxis.cardiology': 'Cardiology', 'healthcare.clinic_or_praxis.dermatology': 'Dermatology', 'healthcare.clinic_or_praxis.paediatrics': 'Pediatrics', 'healthcare.clinic_or_praxis.orthopaedics': 'Orthopedics', 'healthcare.clinic_or_praxis.neurology': 'Neurology', 'healthcare.clinic_or_praxis.general': 'General Practice' }; for (const category of categories) { if (specialtyMap[category]) return specialtyMap[category]; } if (categories.includes('healthcare.clinic_or_praxis')) return 'General Practice'; return 'Healthcare Professional'; }
const findDoctorsAPI = async (location: { lat: number; lng: number }): Promise<Doctor[]> => { const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY; if (!apiKey) throw new Error("API Key is not configured."); const categories = "healthcare.clinic_or_praxis,healthcare.dentist"; const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${location.lng},${location.lat},25000&bias=proximity:${location.lng},${location.lat}&limit=40&apiKey=${apiKey}&details=wiki_and_media`; const response = await fetch(url); if (!response.ok) throw new Error("Failed to find nearby doctors."); const data = await response.json(); if (!data.features || data.features.length === 0) return []; return data.features.map((feature: any): Doctor => ({ id: feature.properties.place_id, name: feature.properties.name, address: feature.properties.address_line2, specialty: mapCategoriesToSpecialty(feature.properties.categories), lat: feature.properties.lat, lng: feature.properties.lon, distance: feature.properties.distance / 1000, photo: feature.properties.wiki_and_media?.image })); };
const getDoctorDetailsAPI = async (placeId: string): Promise<Partial<Doctor>> => { const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY; if (!apiKey) throw new Error("API Key is not configured."); const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`; const response = await fetch(url); if (!response.ok) throw new Error("Failed to fetch doctor details."); const data = await response.json(); if (!data.features || data.features.length === 0) throw new Error("Doctor not found."); const props = data.features[0].properties; return { phone: props.phone || props.datasource?.raw?.phone, website: props.website }; };

// =================================================================================
// 2. UI COMPONENTS
// =================================================================================

const DoctorCard = ({ doctor, onShowDetails, isSaved, onToggleSave }: { doctor: Doctor; onShowDetails: () => void; isSaved: boolean; onToggleSave: () => void; }) => ( <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}> <Card className="h-full flex flex-col overflow-hidden group hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-slate-900 border"> <div className="relative"> <AspectRatio ratio={16/10} className="bg-muted overflow-hidden"> {doctor.photo ? <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800"><User className="w-16 h-16 text-slate-400 dark:text-slate-600" /></div>} </AspectRatio> <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80" onClick={onToggleSave}> <Heart className={`h-5 w-5 transition-all ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} /> </Button> </div> <CardHeader> <div className="flex justify-between items-center"><CardTitle className="line-clamp-1 pr-2">{doctor.name}</CardTitle>{doctor.distance != null && (<Badge variant="secondary">{doctor.distance.toFixed(1)} km</Badge>)}</div> <CardDescription className="pt-1">{doctor.specialty}</CardDescription> </CardHeader> <CardContent className="mt-auto flex gap-2 pt-4"> <Button className="flex-1" onClick={onShowDetails}><Navigation className="w-4 h-4 mr-2"/>Book Appointment</Button> </CardContent> </Card> </motion.div> );
const DetailsBookingModal = ({ doctor, userLocation, onClose, onRequireLocation, onBookAppointment }: { doctor: Doctor; userLocation: {lat: number; lng: number} | null; onClose: () => void; onRequireLocation: () => Promise<{lat: number; lng: number}>; onBookAppointment: (details: Omit<Appointment, 'id' | 'doctor' | 'status'>) => void; }) => { const [activeTab, setActiveTab] = useState('booking'); const [details, setDetails] = useState<Partial<Doctor>>({}); const [isLoading, setIsLoading] = useState(false); const [date, setDate] = useState<Date>(); useEffect(() => { if(activeTab === 'details' && !details.phone && !details.website) { setIsLoading(true); getDoctorDetailsAPI(doctor.id).then(setDetails).catch(console.error).finally(() => setIsLoading(false)); } }, [doctor.id, activeTab, details]); const handleGetDirections = async () => { try { const location = userLocation || await onRequireLocation(); window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${doctor.lat},${doctor.lng}`, "_blank"); } catch {} }; const handleSubmitBooking = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); if (!date) { toast.error("Please select an appointment date."); return; } const bookingDetails = { patientName: formData.get('patientName') as string, patientContact: formData.get('patientContact') as string, appointmentDate: date.toISOString(), reason: formData.get('reason') as string, }; if (!bookingDetails.patientName || !bookingDetails.patientContact) { toast.error("Please fill in your name and contact number."); return; } onBookAppointment(bookingDetails); }; return ( <Dialog open={!!doctor} onOpenChange={(isOpen) => !isOpen && onClose()}> <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{doctor.name}</DialogTitle><DialogDescription>{doctor.specialty} • {doctor.address}</DialogDescription></DialogHeader> <div className="flex border-b"><button onClick={() => setActiveTab('booking')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'booking' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Book</button><button onClick={() => setActiveTab('details')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Details</button></div> <AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}> {activeTab === 'details' && (<div className="py-4 space-y-4">{isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : <> {details.website && <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-muted-foreground" /><a href={details.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{details.website}</a></div>} {details.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><a href={`tel:${details.phone}`} className="hover:underline">{details.phone}</a></div>} {!details.website && !details.phone && <p className="text-center text-muted-foreground">No contact details available.</p>} </>}<div className="grid grid-cols-2 gap-2 pt-2"><Button onClick={handleGetDirections} className="w-full"><Navigation className="w-4 h-4 mr-2"/>Directions</Button>{details.phone ? <Button asChild variant="secondary" className="w-full"><a href={`tel:${details.phone}`}><Phone className="w-4 h-4 mr-2"/>Call Now</a></Button> : <Button variant="secondary" disabled>Call Now</Button>}</div></div>)} {activeTab === 'booking' && (<form onSubmit={handleSubmitBooking} className="py-4 space-y-4"><Input name="patientName" placeholder="Your Full Name" required /><Input name="patientContact" placeholder="Your Phone Number" type="tel" required /><Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-left font-normal">{date ? format(date, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover><Textarea name="reason" placeholder="Briefly describe the reason for your visit..." /><Button type="submit" className="w-full">Request Appointment</Button></form>)} </motion.div></AnimatePresence> </DialogContent> </Dialog> ); };

// UI ENHANCEMENT: Completely redesigned AppointmentsModal
const AppointmentsModal = ({ appointments, onClose }: { appointments: Appointment[]; onClose: () => void; }) => {
    const [activeTab, setActiveTab] = useState<'Upcoming' | 'Pending' | 'Completed'>('Upcoming');
    const filteredAppointments = useMemo(() => 
        appointments.filter(a => a.status === activeTab).sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    , [appointments, activeTab]);
    const getStatusIcon = (status: Appointment['status']) => { 
        const iconMap = { Upcoming: <CalendarClock className="w-5 h-5 text-blue-500" />, Pending: <Hourglass className="w-5 h-5 text-yellow-500" />, Completed: <CheckCircle className="w-5 h-5 text-green-500" /> }; 
        return iconMap[status]; 
    };
    
    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4"><DialogTitle>My Appointments</DialogTitle><DialogDescription>Manage your appointment requests.</DialogDescription></DialogHeader>
                <div className="flex border-b px-6 shrink-0">{['Upcoming', 'Pending', 'Completed'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>))}</div>
                <div className="flex-grow overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                            {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                                <Card key={app.id} className="overflow-hidden">
                                    <div className="flex items-start gap-4 p-4">
                                        <AspectRatio ratio={1} className="w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                                            {/* FIX: Conditional rendering for doctor photo */}
                                            {app.doctor.photo ? (
                                                <img src={app.doctor.photo} alt={app.doctor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                                                    <User className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                                                </div>
                                            )}
                                        </AspectRatio>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg">{app.doctor.name}</p>
                                                    <p className="text-sm text-muted-foreground">{app.doctor.specialty}</p>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 text-xs">
                                                    {getStatusIcon(app.status)}
                                                    <Badge variant={app.status === 'Upcoming' ? 'default' : 'secondary'}>{app.status}</Badge>
                                                </div>
                                            </div>
                                            <div className="text-sm mt-3 space-y-2">
                                                <p className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-muted-foreground" /> {format(new Date(app.appointmentDate), "EEEE, MMMM d, yyyy")}</p>
                                                {app.reason && <p className="flex items-start gap-2"><MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" /> <span className="italic">"{app.reason}"</span></p>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* UI ENHANCEMENT: Action buttons */}
                                    <CardContent className="bg-slate-50 dark:bg-slate-800/50 p-3 flex justify-end gap-2">
                                        {app.status !== 'Completed' ? (
                                            <>
                                                <Button size="sm" variant="ghost">Cancel</Button>
                                                <Button size="sm" variant="outline">Reschedule</Button>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="outline">View Summary</Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )) : <p className="text-center text-muted-foreground py-16">No {activeTab.toLowerCase()} appointments.</p>}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SkeletonGrid = () => ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 12 }).map((_, i) => ( <div key={i} className="flex flex-col space-y-3"><Skeleton className="h-[150px] w-full rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div> ))}</div>);

// =================================================================================
// 3. MAIN PAGE COMPONENT
// =================================================================================

export default function NextLevelDoctorFinder() {
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [savedDoctors, setSavedDoctors] = useLocalStorage<Doctor[]>("savedDoctors", []);
    const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [appointments, setAppointments] = useLocalStorage<Appointment[]>("appointments", []);
    const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);

    useEffect(() => setIsMounted(true), []);

    const toggleSaveDoctor = (doctor: Doctor) => {
        const isSaved = savedDoctors.some((d: Doctor) => d.id === doctor.id);
        if (isSaved) {
            toast.info(`${doctor.name} removed from saved.`);
            setSavedDoctors(savedDoctors.filter((d: Doctor) => d.id !== doctor.id));
        } else {
            toast.success(`${doctor.name} saved!`);
            setSavedDoctors([doctor, ...savedDoctors]);
        }
    };
    const requestLocation = (showToast = true): Promise<{ lat: number; lng: number }> => { return new Promise((resolve, reject) => { if (userLocation) { resolve(userLocation); return; } if(showToast) toast.info("Requesting your location..."); navigator.geolocation.getCurrentPosition( (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); if(showToast) toast.success("Location found!"); resolve(loc); }, (err) => { if(showToast) toast.error("Location access was denied."); reject(err); } ); }); };
    const handleNearMeSearch = async (showToast = true) => { setStatus("loading"); try { const location = await requestLocation(showToast); const nearbyResults = await findDoctorsAPI(location); setAllDoctors(nearbyResults); setStatus("success"); if(showToast) toast.success(`Found ${nearbyResults.length} doctors near you.`); } catch { setStatus(allDoctors.length > 0 ? "success" : "idle"); } };
    const displayedDoctors = useMemo(() => { let doctors = showSavedOnly ? savedDoctors : allDoctors; if (specialtyFilter !== "All Specialties") { doctors = doctors.filter(d => d.specialty === specialtyFilter); } return doctors; }, [allDoctors, specialtyFilter, showSavedOnly, savedDoctors]);
    const clearFilters = () => { setShowSavedOnly(false); setSpecialtyFilter("All Specialties"); toast.info("Filters cleared."); };

    useEffect(() => {
        // Automatically find location on load if permission is already granted
        navigator.permissions?.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted') { handleNearMeSearch(false); }});
    }, []); // Empty dependency array ensures this runs only once

    const handleBookAppointment = (details: Omit<Appointment, 'id' | 'doctor' | 'status'>) => {
        if (!selectedDoctor) return;
        const newAppointment: Appointment = {
            id: `app_${Date.now()}`,
            doctor: selectedDoctor,
            ...details,
            status: 'Pending',
        };
        setAppointments([newAppointment, ...appointments]);
        toast.success(`Appointment requested with ${selectedDoctor.name}!`);
        setSelectedDoctor(null);
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Header />
            {isMounted && selectedDoctor && <DetailsBookingModal doctor={selectedDoctor} userLocation={userLocation} onClose={() => setSelectedDoctor(null)} onRequireLocation={requestLocation} onBookAppointment={handleBookAppointment} />}
            {isMounted && isAppointmentsModalOpen && <AppointmentsModal appointments={appointments} onClose={() => setIsAppointmentsModalOpen(false)} />}

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Find Your Specialist</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Discover trusted healthcare professionals in your area instantly.</p>
                </div>

                <Card className="p-4 sticky top-20 z-20 bg-background/80 backdrop-blur-lg shadow-lg mb-8">
                     <div className="flex flex-col md:flex-row gap-4 items-center">
                        <Button onClick={() => handleNearMeSearch()} className="w-full md:w-auto h-12 text-base flex-shrink-0" disabled={status === "loading"}>
                             {status === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LocateFixed className="mr-2 h-5 w-5" />}
                             Find Doctors Near Me
                        </Button>
                        <div className="flex-grow w-full h-[1px] md:h-auto md:w-auto md:border-l border-border mx-4"></div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter} disabled={!allDoctors.length}><SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger><SelectContent>{SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                            {isMounted && <label htmlFor="saved-only" className="flex items-center justify-center h-12 px-4 rounded-md border gap-2 font-medium cursor-pointer w-full sm:w-auto hover:bg-accent"><Switch id="saved-only" checked={showSavedOnly} onCheckedChange={setShowSavedOnly} /> Saved ({savedDoctors.length})</label>}
                        </div>
                        {isMounted && (
                             <Button onClick={() => setIsAppointmentsModalOpen(true)} variant="outline" className="w-full md:w-auto h-12 text-base flex-shrink-0 relative">
                                <CalendarClock className="mr-2 h-5 w-5" />
                                My Appointments
                                {/* FIX: Notification badge logic */}
                                {appointments.filter(a => a.status === 'Pending' || a.status === 'Upcoming').length > 0 && <Badge className="absolute -top-2 -right-2">{appointments.filter(a => a.status === 'Pending' || a.status === 'Upcoming').length}</Badge>}
                            </Button>
                        )}
                     </div>
                </Card>

                <div className="mt-8">
                    {status === "loading" ? <SkeletonGrid /> :
                     displayedDoctors.length > 0 ? (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           <AnimatePresence>{displayedDoctors.map(d => <DoctorCard key={d.id} doctor={d} onShowDetails={() => setSelectedDoctor(d)} isSaved={savedDoctors.some(s => s.id === d.id)} onToggleSave={() => toggleSaveDoctor(d)} />)}</AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <User className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold">{allDoctors.length > 0 ? 'No Doctors Match Your Filters' : 'No Doctors Found Nearby'}</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{allDoctors.length > 0 ? 'Try adjusting or clearing your filters to see more results.' : 'Click "Find Doctors Near Me" to begin your search.'}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}