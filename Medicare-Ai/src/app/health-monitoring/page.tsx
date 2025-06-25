"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HealthChart from "@/components/HealthChart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Interfaces for our data structures
interface HealthEntry {
  bp_systolic: string;
  bp_diastolic: string;
  blood_sugar: string;
  weight: string;
  sleep: string;
  timestamp: string;
}

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

const METRICS = [
  { label: "Blood Pressure (Systolic)", key: "bp_systolic", type: "number" },
  { label: "Blood Pressure (Diastolic)", key: "bp_diastolic", type: "number" },
  { label: "Blood Sugar Level", key: "blood_sugar", type: "number" },
  { label: "Weight (kg)", key: "weight", type: "number" },
  { label: "Hours of Sleep", key: "sleep", type: "number" },
] as const;

type MetricKey = typeof METRICS[number]["key"];
type FormState = Record<MetricKey, string>;

function getStoredData(): HealthEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("health_metrics");
  return data ? JSON.parse(data) : [];
}

function saveData(data: HealthEntry[]) {
  localStorage.setItem("health_metrics", JSON.stringify(data));
}

// A component for the Patient Monitoring Dashboard feature
function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<Record<string, MedicalEvent | null>>({});
  const [latestMedStatus, setLatestMedStatus] = useState<MedicalEvent | null>(null);
  const [activityLog, setActivityLog] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get the latest metric from a list of events
  const getLatestMetric = (events: MedicalEvent[], metricName: string): MedicalEvent | null => {
    const metricEvents = events
      .filter(e => e.event_type === 'Metric_Measurement' && e.event_data.metric === metricName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return metricEvents.length > 0 ? metricEvents[0] : null;
  };

  useEffect(() => {
    fetch('/dataset.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const mainPatient = jsonData.patients.find((p: Patient) => p.patient_id === 'PAT001');
        setPatient(mainPatient);

        const patientEvents = jsonData.medical_events.filter((e: MedicalEvent) => e.patient_id === 'PAT001');
        
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
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load patient data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center py-10">Loading Patient Data...</p>;
  if (!patient) return <p className="text-center py-10 text-red-500">Could not find data for patient PAT001.</p>;

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

  return (
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
  );
}

// Main page component
export default function HealthMonitoring() {
  const [form, setForm] = useState<FormState>({
    bp_systolic: "", bp_diastolic: "", blood_sugar: "", weight: "", sleep: "",
  });
  const [data, setData] = useState<HealthEntry[]>([]);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    setData(getStoredData());
  }, []);

  useEffect(() => {
    if (data.length > 0) saveData(data);
  }, [data]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const entry: HealthEntry = { ...form, timestamp: new Date().toISOString() };
    setData([...data, entry]);
    setForm({ bp_systolic: "", bp_diastolic: "", blood_sugar: "", weight: "", sleep: "" });
    if (+form.bp_systolic > 140 || +form.bp_diastolic > 90) {
      setInsight("High blood pressure detected. Please consult a doctor.");
    } else if (+form.blood_sugar > 180) {
      setInsight("High blood sugar detected. Please consult a doctor.");
    } else {
      setInsight("Your latest entries are within normal ranges. Keep up the great work!");
    }
  }

  const chartLabels = data.map((d) => new Date(d.timestamp).toLocaleDateString());

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Section 1: Patient Monitoring Dashboard */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Patient Monitoring Dashboard</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Real-time overview of patient PAT001.
            </p>
        </div>
        
        <PatientDashboard />

        <div className="border-t border-slate-200 dark:border-slate-700 my-16"></div>
        
        {/* Section 2: Manual Health Metric Logging */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Health Monitoring</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Log your daily metrics to track your health over time.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-1">
                <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg shadow">
                {METRICS.map((metric) => (
                    <div key={metric.key}>
                    <label className="block font-medium mb-1 text-sm">{metric.label}</label>
                    <input
                        type={metric.type}
                        name={metric.key}
                        value={form[metric.key]}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 bg-input text-foreground"
                        required
                        step="any"
                    />
                    </div>
                ))}
                <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 rounded-md transition-colors"
                >
                    Add New Entry
                </button>
                </form>
            </div>
            <div className="md:col-span-2">
                {insight && (
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                    <p className="font-bold">AI Insight</p>
                    <p>{insight}</p>
                </div>
                )}
                 {data.length === 0 && !insight && (
                    <div className="text-center p-8 bg-card rounded-lg shadow">
                        <p className="text-muted-foreground">Your charts will appear here once you add your first health entry.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {METRICS.map((metric) => (
                    <div key={metric.key} className="p-4 bg-card rounded-lg shadow">
                        <HealthChart
                            chartId={metric.key}
                            title={metric.label}
                            labels={chartLabels}
                            data={data.map((d) => Number(d[metric.key]) || 0)}
                        />
                    </div>
                ))}
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
