"use client"
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Briefcase, Lock } from "lucide-react";

export default function ProfilePage() {
    const [doctor, setDoctor] = useState({
        name: 'Dr. Alex Reeves',
        email: 'alex.r@medicare.com',
        specialty: 'Cardiology',
        bio: 'Dr. Alex Reeves is a dedicated cardiologist with over 10 years of experience in diagnosing and treating heart conditions. Committed to patient-centered care and utilizing the latest medical technologies.',
        avatar: '/placeholder.svg'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDoctor(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, you would send this data to your backend
        console.log('Saved data:', doctor);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback className="text-4xl">{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='text-center sm:text-left'>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{doctor.name}</h1>
                    <p className="text-xl text-indigo-600 font-semibold">{doctor.specialty}</p>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-indigo-500" />
                        <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Personal & Professional Information</CardTitle>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'outline' : 'default'}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={doctor.name} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" value={doctor.email} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="specialty">Specialty</Label>
                            <Input id="specialty" name="specialty" value={doctor.specialty} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="bio">Biography</Label>
                            <Textarea id="bio" name="bio" value={doctor.bio} onChange={handleInputChange} disabled={!isEditing} rows={5} />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-indigo-500" />
                        <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Account Settings</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                     <div className="flex justify-end mt-4">
                        <Button>Update Password</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 