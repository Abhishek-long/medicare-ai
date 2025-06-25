"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users } from "lucide-react";

export default function EarningsPage() {
    const totalEarnings = 125850.75;
    const avgMonthly = totalEarnings / 7;
    const topPatient = { name: "Robert Brown", value: 18500 };

    const earningsHistory = [
        { id: "inv-001", patient: "John Doe", service: "Appendectomy", date: "2024-07-15", amount: 12000 },
        { id: "inv-002", patient: "Jane Smith", service: "Knee Replacement", date: "2024-06-10", amount: 15000 },
        { id: "inv-003", patient: "Robert Brown", service: "Coronary Bypass", date: "2024-06-28", amount: 18500 },
        { id: "inv-004", patient: "Alice Johnson", service: "Consultation", date: "2024-07-12", amount: 350 },
    ];

    const incomeByService = [
        { service: "Surgery", total: 85000 },
        { service: "Consultation", total: 15500 },
        { service: "Diagnostics", total: 25350.75 },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Earnings</h1>
                <p className="text-slate-500 dark:text-slate-400">Track your income and financial performance.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">${totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">Lifetime earnings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg. Monthly Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">${avgMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">Based on last 7 months</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Top Contributing Patient</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{topPatient.name}</div>
                        <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">Contribution: ${topPatient.value.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3 bg-white dark:bg-slate-900">
                    <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Earnings History</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {earningsHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-slate-900 dark:text-slate-50">{item.id}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">{item.patient}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">{item.service}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">{item.date}</TableCell>
                                        <TableCell className="text-right font-semibold text-indigo-600">${item.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
                    <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Income by Service</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={incomeByService} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="service" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value/1000)}k`} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    color: '#334155',
                                  }}
                                />
                                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 