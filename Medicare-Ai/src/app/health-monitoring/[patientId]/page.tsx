"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Interfaces for our data structures
interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  diagnosed_chronic_conditions: string[];
  medication_history: string[];
  lifestyle_factors: {
    smoker: string;
    activity_level: string;
  };
}

interface MedicalEvent {
  patient_id: string;
  timestamp: string;
  event_type: string;
  event_data: any;
}

// Reusable Metric Card component
const MetricCard = ({ title, metric }: { title: string, metric: MedicalEvent | null }) => {
  const isBp = metric?.event_data.metric === 'Blood_Pressure';
  const value = isBp ? `${metric?.event_data.systolic} / ${metric?.event_data.diastolic}` : metric?.event_data.value;
  const unit = isBp ? 'mmHg' : metric?.event_data.unit;

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {metric ? (
          <p className="text-2xl font-bold">{value} <span className="text-sm font-normal text-slate-500 ml-2">{unit}</span></p>
        ) : <p>No measurement found.</p>}
      </CardContent>
    </Card>
  );
};

// The main page component for an individual patient's dashboard
export default function PatientDashboardPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<Record<string, MedicalEvent | null>>({});
  const [latestMedStatus, setLatestMedStatus] = useState<MedicalEvent | null>(null);
  const [activityLog, setActivityLog] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const getLatestMetric = (events: MedicalEvent[], metricName: string): MedicalEvent | null => {
    const metricEvents = events
      .filter(e => e.event_type === 'Metric_Measurement' && e.event_data.metric === metricName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return metricEvents.length > 0 ? metricEvents[0] : null;
  };

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    
    fetch('/dataset.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const currentPatient = jsonData.patients.find((p: Patient) => p.patient_id === patientId);
        setPatient(currentPatient);

        if (currentPatient) {
          const patientEvents = jsonData.medical_events.filter((e: MedicalEvent) => e.patient_id === patientId);
          
          setLatestMetrics({
            'Blood_Pressure': getLatestMetric(patientEvents, 'Blood_Pressure'),
            'Blood_Sugar': getLatestMetric(patientEvents, 'Blood_Sugar'),
            'Hemoglobin': getLatestMetric(patientEvents, 'Hemoglobin'),
            'WBC': getLatestMetric(patientEvents, 'WBC'),
            'RBC': getLatestMetric(patientEvents, 'RBC'),
          });

          const medEvents = patientEvents
            .filter((e: MedicalEvent) => e.event_type === 'Medication_Taken')
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLatestMedStatus(medEvents.length > 0 ? medEvents[0] : null);

          const sortedEvents = patientEvents.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivityLog(sortedEvents.slice(0, 5));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load patient data:", error);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
        <p className="text-center py-10 text-lg">Loading Patient Data...</p>
    </div>
  );
  if (!patient) return (
    <div className="flex justify-center items-center min-h-screen">
        <p className="text-center py-10 text-lg text-red-500">Could not find data for patient {patientId}.</p>
    </div>
  );
  
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Patient Monitoring Dashboard</h1>
        </div>
        
        <div className="space-y-8">
          <header className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Patient ID: {patient.patient_id}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-600 dark:text-slate-300 mt-2">
              <span>{patient.age} years old</span>
              <span>{patient.gender}</span>
              <span>Smoker: {patient.lifestyle_factors.smoker}</span>
              <span className="w-full sm:w-auto">Conditions: {patient.diagnosed_chronic_conditions.join(', ')}</span>
            </div>
          </header>

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MetricCard title="Latest Blood Pressure" metric={latestMetrics['Blood_Pressure']} />
            <MetricCard title="Latest Blood Sugar" metric={latestMetrics['Blood_Sugar']} />
            <MetricCard title="Hemoglobin" metric={latestMetrics['Hemoglobin']} />
            <MetricCard title="WBC Count" metric={latestMetrics['WBC']} />
            <MetricCard title="RBC Count" metric={latestMetrics['RBC']} />
            <Card>
              <CardHeader><CardTitle>Medication Status</CardTitle></CardHeader>
              <CardContent>
                {latestMedStatus ? (
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold">{latestMedStatus.event_data.medication}:</p>
                    <Badge variant={latestMedStatus.event_data.status === 'Skipped' ? 'destructive' : 'default'}>
                      {latestMedStatus.event_data.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ) : <p>No medication event found.</p>}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader><CardTitle>Recent Activity Log</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {activityLog.map((event, index) => (
                    <li key={index} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-sm">
                      <div className="mb-2 sm:mb-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{event.event_type.replace(/_/g, ' ')}: </span>
                        {event.event_type === 'Metric_Measurement' && (event.event_data.metric === 'Blood_Pressure' ? `${event.event_data.systolic}/${event.event_data.diastolic} mmHg` : `${event.event_data.value} ${event.event_data.unit}`)}
                        {event.event_type === 'Medication_Taken' && `${event.event_data.medication} - ${event.event_data.status.replace(/_/g, ' ')}`}
                        {event.event_type === 'Symptom_Log' && `${event.event_data.symptom} (${event.event_data.severity})`}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 self-end sm:self-center">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
} 