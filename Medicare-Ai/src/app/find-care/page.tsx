"use client";

import { useState, ReactNode, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, MapPin, Loader2, Navigation, Hospital as HospitalIcon, Globe, Phone, Building, LocateFixed, Heart, X, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

// =================================================================================
// 1. DATA, HOOKS & API LOGIC
// =================================================================================

interface Hospital {
    id: string; name: string; address: string; country: string;
    lat: number; lng: number; photo?: string; distance?: number;
    phone?: string; website?: string;
}

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

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lng2 - lng1) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }

const getAutocompleteAPI = async (text: string, biasLocation?: { lat: number; lng: number }): Promise<Hospital[]> => {
    if (!text) return [];
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) throw new Error("API Key is not configured.");
    let url = `https://api.geoapify.com/v2/geocode/autocomplete?text=${encodeURIComponent(text)}&type=amenity&filter=category:healthcare.hospital&format=json&apiKey=${apiKey}`;
    if (biasLocation) { url += `&bias=proximity:${biasLocation.lng},${biasLocation.lat}`; }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch suggestions.");
    const data = await response.json();
    return (data.results || []).map((r: any) => ({ id: r.place_id, name: r.name || r.address_line1, address: r.formatted, country: r.country, lat: r.lat, lng: r.lon }));
};

const findNearbyHospitalsAPI = async (location: { lat: number; lng: number }): Promise<Hospital[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) throw new Error("API Key is not configured.");
    const url = `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${location.lng},${location.lat},50000&bias=proximity:${location.lng},${location.lat}&limit=20&apiKey=${apiKey}&details=wiki_and_media`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to find nearby hospitals.");
    const data = await response.json();
    if (!data.features || data.features.length === 0) return [];
    return data.features.map((feature: any): Hospital => ({
        id: feature.properties.place_id, name: feature.properties.name, address: feature.properties.address_line2,
        country: feature.properties.country, lat: feature.properties.lat, lng: feature.properties.lon,
        distance: feature.properties.distance / 1000, photo: feature.properties.wiki_and_media?.image,
    }));
};

const getHospitalDetailsAPI = async (placeId: string): Promise<Hospital> => {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) throw new Error("API Key is not configured.");
    const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch hospital details.");
    const data = await response.json();
    if (!data.features || data.features.length === 0) throw new Error("Hospital not found.");
    const props = data.features[0].properties;
    return {
        id: props.place_id, name: props.name, address: props.address_line2, country: props.country,
        lat: props.lat, lng: props.lon, phone: props.phone || props.datasource?.raw?.phone,
        website: props.website, photo: props.wiki_and_media?.image
    };
};

// =================================================================================
// 2. UI COMPONENTS
// =================================================================================

const HospitalCard = ({ hospital, onShowDetails, isSaved, onToggleSave }: { hospital: Hospital; onShowDetails: () => void; isSaved: boolean; onToggleSave: () => void; }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <Card className="h-full flex flex-col overflow-hidden group hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-slate-900 border">
            <div className="relative">
                <AspectRatio ratio={16 / 10} className="bg-muted overflow-hidden">
                    {hospital.photo ? <img src={hospital.photo} alt={hospital.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800"><HospitalIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" /></div>}
                </AspectRatio>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80" onClick={onToggleSave}>
                    <Heart className={`h-5 w-5 transition-all ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </Button>
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-2">{hospital.name}</CardTitle>
                <CardDescription className="pt-2 flex justify-between items-start gap-4 text-sm">
                    <span className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{hospital.address}</span></span>
                    {hospital.distance != null && <span className="font-bold text-primary whitespace-nowrap">{hospital.distance.toFixed(0)} km</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex gap-2 pt-4">
                 <Button className="flex-1" onClick={onShowDetails}><Navigation className="w-4 h-4 mr-2"/>Details & Directions</Button>
            </CardContent>
        </Card>
    </motion.div>
);

const DetailsModal = ({ hospital, userLocation, onClose, onRequireLocation }: { hospital: Hospital; userLocation: {lat: number, lng: number} | null; onClose: () => void; onRequireLocation: () => Promise<{lat: number, lng: number}> }) => {
    const [details, setDetails] = useState<Partial<Hospital>>(hospital);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getHospitalDetailsAPI(hospital.id).then(setDetails).catch(console.error).finally(() => setIsLoading(false));
    }, [hospital.id]);

    const handleGetDirections = async () => {
        try {
            const location = userLocation || await onRequireLocation();
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${hospital.lat},${hospital.lng}`, "_blank");
        } catch (err) { /* Error toast is handled by onRequireLocation */ }
    };

    return (
        <Dialog open={!!hospital} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader><DialogTitle>{details.name}</DialogTitle><DialogDescription>{details.address}</DialogDescription></DialogHeader>
                <div className="py-4 space-y-4">
                    {isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : <>
                        {details.website && <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-muted-foreground" /><a href={details.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{details.website}</a></div>}
                        {details.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><a href={`tel:${details.phone}`} className="hover:underline">{details.phone}</a></div>}
                        {!details.website && !details.phone && <p className="text-center text-muted-foreground">No contact details available.</p>}
                    </>}
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                    <Button onClick={handleGetDirections} className="w-full sm:w-auto"><Navigation className="w-4 h-4 mr-2"/>Get Directions</Button>
                    {details.phone && <Button asChild variant="secondary" className="w-full sm:w-auto"><a href={`tel:${details.phone}`}><Phone className="w-4 h-4 mr-2"/>Call Now</a></Button>}
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[150px] w-full rounded-xl" />
                <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
            </div>
        ))}
    </div>
);

// =================================================================================
// 3. MAIN PAGE COMPONENT
// =================================================================================

export default function AdvancedHospitalSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<Hospital[]>([]);
    const [results, setResults] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [savedHospitals, setSavedHospitals] = useLocalStorage<Hospital[]>("savedHospitals", []);
    const [recentSearches, setRecentSearches] = useLocalStorage<Hospital[]>("recentSearches", []);
    
    // Filter States
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [radiusFilter, setRadiusFilter] = useState(5000); // Default 5000km for global

    // HYDRATION ERROR FIX: Only render components that use localStorage after the client has mounted.
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const addToRecents = (hospital: Hospital) => {
        setRecentSearches([
            hospital,
            ...recentSearches.filter((h: Hospital) => h.id !== hospital.id)
        ].slice(0, 5));
    };
    const toggleSaveHospital = (hospital: Hospital) => {
        const isSaved = savedHospitals.some(h => h.id === hospital.id);
        if (isSaved) { setSavedHospitals(savedHospitals.filter(h => h.id !== hospital.id)); toast.info(`${hospital.name} removed from saved.`); } 
        else { setSavedHospitals([hospital, ...savedHospitals]); toast.success(`${hospital.name} saved!`); }
    };
    
    // Auto-check for location on initial load
    useEffect(() => {
        navigator.permissions?.query({ name: 'geolocation' }).then(p => {
            if (p.state === 'granted') {
                handleNearMeSearch(false); // Silently search on load
            }
        });
    }, []);

    // Autocomplete effect
    useEffect(() => {
        if (debouncedSearchTerm.length > 2) {
            getAutocompleteAPI(debouncedSearchTerm, userLocation || undefined).then(setSuggestions).catch(() => setSuggestions([]));
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm, userLocation]);

    const requestLocation = (showToast = true): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (userLocation) { resolve(userLocation); return; }
            if(showToast) toast.info("Requesting your location...");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(loc);
                    if(showToast) toast.success("Location found!");
                    resolve(loc);
                },
                (err) => {
                    if(showToast) toast.error("Location access denied.");
                    reject(err);
                }
            );
        });
    };

    const handleSuggestionClick = (placeId: string) => {
        setSearchTerm(""); setSuggestions([]); setStatus("loading");
        toast.promise(getHospitalDetailsAPI(placeId), {
            loading: "Fetching hospital details...",
            success: (result) => { setResults([result]); addToRecents(result); setStatus("success"); return `Details for ${result.name} loaded.`; },
            error: (err: any) => { setStatus("error"); return err.message; }
        });
    };

    const handleNearMeSearch = async (showToast = true) => {
        setStatus("loading");
        try {
            const location = await requestLocation(showToast);
            const nearbyResults = await findNearbyHospitalsAPI(location);
            setResults(nearbyResults);
            setStatus("success");
            if(showToast) toast.success(`Found ${nearbyResults.length} nearby hospitals.`);
        } catch {
            setStatus(results.length > 0 ? "success" : "idle");
        }
    };
    
    const displayedHospitals = useMemo(() => {
        let hospitals = showSavedOnly ? savedHospitals : results;
        if (userLocation) {
            const withDistance = hospitals.map(h => ({ ...h, distance: getDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) }));
            const filteredByRadius = withDistance.filter(h => h.distance! <= radiusFilter);
            return filteredByRadius.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        return hospitals;
    }, [results, userLocation, showSavedOnly, savedHospitals, radiusFilter]);

    const clearFilters = () => {
        setShowSavedOnly(false);
        setRadiusFilter(5000);
        toast.info("Filters cleared.");
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-black">
            <Header />
            {selectedHospital && <DetailsModal hospital={selectedHospital} userLocation={userLocation} onClose={() => setSelectedHospital(null)} onRequireLocation={requestLocation} />}
            <main className="container mx-auto px-4 py-8 md:py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400">
                        Universal Hospital Finder
                    </motion.h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground">Search for any hospital by name, or discover top-rated facilities near you.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-2xl mx-auto mt-10">
                    <Card className="p-4 md:p-6 shadow-2xl shadow-slate-300/20 dark:shadow-black/50 bg-background/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                            <Input type="search" placeholder="Start typing a hospital name..." className="pl-12 h-14 text-lg w-full rounded-full border-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                        {suggestions.map(s => <li key={s.id} onClick={() => handleSuggestionClick(s.id)} className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0"><p className="font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.address}</p></li>)}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="relative flex items-center my-4"><div className="flex-grow border-t"></div><span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground">Or</span><div className="flex-grow border-t"></div></div>
                        <Button onClick={() => handleNearMeSearch()} size="lg" variant="secondary" className="w-full h-12 text-base" disabled={status === "loading"}>
                             {status === "loading" && !searchTerm ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LocateFixed className="mr-2 h-5 w-5" />}
                             Find Hospitals Near Me
                        </Button>
                    </Card>

                    {isMounted && recentSearches.length > 0 && !showSavedOnly && (
                        <div className="mt-6 text-center">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recent:</h4>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {recentSearches.map(h => <Button key={h.id} variant="outline" size="sm" onClick={() => { setResults([h]); setStatus('success'); addToRecents(h); }}>{h.name}</Button>)}
                            </div>
                        </div>
                    )}
                </motion.div>

                {isMounted && results.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto mt-8">
                        <Card className="p-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                 <div className="flex items-center gap-2 font-bold text-lg"><Settings2 className="h-5 w-5"/> Filters</div>
                                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                    <label htmlFor="saved-only" className="flex items-center gap-2 font-medium cursor-pointer"><Switch id="saved-only" checked={showSavedOnly} onCheckedChange={setShowSavedOnly} /> Show Saved ({savedHospitals.length})</label>
                                    {userLocation && (
                                        <div className="flex items-center gap-2 w-full md:w-64">
                                            <label htmlFor="radius" className="font-medium whitespace-nowrap">Radius: {radiusFilter} km</label>
                                            <Slider id="radius" min={5} max={5000} step={5} value={[radiusFilter]} onValueChange={(val) => setRadiusFilter(val[0])} />
                                        </div>
                                    )}
                                 </div>
                                 {(showSavedOnly || (userLocation && radiusFilter < 5000)) && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-2 h-4 w-4"/>Clear Filters</Button>}
                            </div>
                        </Card>
                    </motion.div>
                )}

                <div className="mt-12">
                    {status === "loading" ? <SkeletonGrid /> :
                     displayedHospitals.length > 0 ? (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           <AnimatePresence>{displayedHospitals.map(h => <HospitalCard key={h.id} hospital={h} onShowDetails={() => { setSelectedHospital(h); addToRecents(h); }} isSaved={savedHospitals.some(sh => sh.id === h.id)} onToggleSave={() => toggleSaveHospital(h)} />)}</AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                <Building className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
                                <h3 className="text-2xl font-semibold">
                                    {status === 'error' ? 'Search Failed' : (results.length > 0 ? 'No Results Match Filters' : 'Your Search Awaits')}
                                </h3>
                                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                     {status === 'error' ? 'There was an issue with the search. Please try again.' : (results.length > 0 ? 'Try adjusting or clearing your filters.' : 'Enter a hospital name to see live suggestions, or find facilities near you.')}
                                </p>
                            </motion.div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}