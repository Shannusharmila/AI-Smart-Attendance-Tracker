'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, MapPin, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Loader2, ScanFace, Image as ImageIcon, X, Pencil, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { ConfidenceBar, RecognitionBadge } from '@/components/shared/confidence-bar';
import { EmptyState } from '@/components/shared/badges';
import { PERIODS, SCHOOL_LOCATION } from '@/lib/constants';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';

interface Props {
  teacher: { id: string; name: string; email: string; subject: string; classes: string[] };
  onSaved: () => void;
}

type Step = 'setup' | 'capture' | 'processing' | 'results' | 'gps' | 'confirm' | 'success';

interface StudentResult {
  studentId: string;
  studentName: string;
  rollNumber: string;
  recognized: boolean;
  confidence: number;
  status: 'PRESENT' | 'ABSENT';
  manuallyModified: boolean;
  anomalyFlag: boolean;
  anomalyReason: string | null;
}

export function TakeAttendance({ teacher, onSaved }: Props) {
  const setSection = useAppStore((s) => s.setSection);
  const currentUser = useAppStore((s) => s.currentUser);

  const [step, setStep] = useState<Step>('setup');
  const [className, setClassName] = useState<string>(teacher.classes[0] || 'CSE-A');
  const [section, setSectionName] = useState<string>(teacher.classes[0]?.split('-')[1] || 'A');
  const [subjectName, setSubjectName] = useState<string>(teacher.subject);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<string>('1');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [processingMsg, setProcessingMsg] = useState<string>('Detecting faces…');
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gpsVerified, setGpsVerified] = useState<boolean>(false);
  const [gpsData, setGpsData] = useState<{ distance: number; status: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch students for the selected class when entering capture step
  async function fetchStudents() {
    try {
      const res = await fetch(`/api/students?className=${className}`);
      const data = await res.json();
      if (data.length === 0) {
        toast.error(`No students in class ${className}`);
        return false;
      }
      return true;
    } catch {
      toast.error('Failed to load students');
      return false;
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function useSampleImage() {
    // Create a simple data-url placeholder showing a stylized classroom
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#fef3c7"/>
      <text x="200" y="120" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#92400e">Sample Classroom Image</text>
      <text x="200" y="160" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#a16207">(Demo Mode placeholder)</text>
      <circle cx="100" cy="220" r="20" fill="#fcd34d"/>
      <circle cx="160" cy="220" r="20" fill="#fcd34d"/>
      <circle cx="220" cy="220" r="20" fill="#fcd34d"/>
      <circle cx="280" cy="220" r="20" fill="#fcd34d"/>
      <circle cx="340" cy="220" r="20" fill="#fcd34d"/>
    </svg>`;
    setImagePreview(`data:image/svg+xml;base64,${btoa(svg)}`);
    setImageFile(null);
    toast.info('Sample classroom image loaded (Demo Mode)');
  }

  async function runAIRecognition() {
    setStep('processing');
    setProcessingProgress(0);
    setProcessingMsg('Detecting faces…');

    // Animate progress + cycle messages
    const messages = [
      'Detecting faces…',
      'Extracting facial features…',
      'Matching with student database…',
      'Calculating confidence scores…',
    ];
    let progress = 0;
    let msgIdx = 0;
    const interval = setInterval(() => {
      progress += 4;
      setProcessingProgress(Math.min(100, progress));
      const idx = Math.min(messages.length - 1, Math.floor(progress / 25));
      if (idx !== msgIdx) {
        msgIdx = idx;
        setProcessingMsg(messages[msgIdx]);
      }
      if (progress >= 100) clearInterval(interval);
    }, 100);

    // Fetch students
    let studentList: { id: string; name: string; rollNumber: string }[] = [];
    try {
      const res = await fetch(`/api/students?className=${className}`);
      studentList = await res.json();
    } catch {
      toast.error('Failed to load students');
      setStep('capture');
      return;
    }

    // Call simulated AI
    try {
      const aiRes = await fetch('/api/demo/ai-recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: studentList.map((s) => s.id) }),
      });
      const aiData = await aiRes.json();

      // Wait for processing animation to complete (2.5s total)
      await new Promise((r) => setTimeout(r, 500));

      const results: StudentResult[] = aiData.results.map((r: any) => ({
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        recognized: r.recognized,
        confidence: r.confidence,
        status: r.status,
        manuallyModified: false,
        anomalyFlag: r.recognized && r.confidence < 80,
        anomalyReason: r.recognized && r.confidence < 80 ? 'Low face-recognition confidence' : null,
      }));

      setStudents(results);
      setStep('results');
      toast.success(`${aiData.detected} students detected · ${aiData.recognized} recognized · ${aiData.notRecognized} not recognized`);
    } catch {
      toast.error('AI recognition failed');
      setStep('capture');
    }
  }

  function toggleStudentStatus(idx: number) {
    setStudents((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT', manuallyModified: true }
          : s
      )
    );
  }

  async function verifyGPS(fail = false) {
    try {
      const res = await fetch('/api/demo/gps-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fail }),
      });
      const data = await res.json();
      setGpsData({ distance: data.distance, status: data.status });
      setGpsVerified(data.verified);
      if (data.verified) {
        toast.success('Location verified — within school radius');
      } else {
        toast.error('Location verification failed');
      }
    } catch {
      toast.error('GPS verification failed');
    }
  }

  async function saveAttendance() {
    if (!gpsVerified) {
      toast.error('GPS verification required before saving');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          section: className.split('-')[1] || section,
          subjectName,
          date,
          period,
          teacherId: teacher.id,
          gpsVerified,
          gpsDistance: gpsData?.distance,
          method: 'AI',
          records: students.map((s) => ({
            studentId: s.studentId,
            studentName: s.studentName,
            rollNumber: s.rollNumber,
            status: s.status,
            method: s.manuallyModified ? 'MANUAL' : 'AI',
            confidence: s.confidence,
            manuallyModified: s.manuallyModified,
            anomalyFlag: s.anomalyFlag,
            anomalyReason: s.anomalyReason,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save attendance');
        setSaving(false);
        return;
      }
      setStep('success');
      setTimeout(() => {
        onSaved();
        setSection('dashboard');
        toast.success('Attendance successfully recorded');
      }, 2200);
    } catch {
      toast.error('Network error saving attendance');
      setSaving(false);
    }
  }

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const recognizedCount = students.filter((s) => s.recognized).length;
  const anomalyCount = students.filter((s) => s.anomalyFlag).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {step !== 'setup' && step !== 'success' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'capture') setStep('setup');
              else if (step === 'results') setStep('capture');
              else if (step === 'gps') setStep('results');
              else if (step === 'confirm') setStep('gps');
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Take Attendance</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 text-xs">
        {['Setup', 'Photo', 'AI Recognition', 'GPS', 'Confirm'].map((label, i) => {
          const stepOrder = ['setup', 'capture', 'results', 'gps', 'confirm'];
          const currentIdx = stepOrder.indexOf(step === 'processing' ? 'capture' : step === 'success' ? 'confirm' : step);
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden sm:inline ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>{label}</span>
              {i < 4 && <div className={`h-0.5 flex-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: SETUP */}
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="card-shadow border-slate-200/80">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Session details</h2>
                  <p className="text-sm text-slate-500">Choose the class and time for this attendance session.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Class</Label>
                    <Select value={className} onValueChange={(v) => { setClassName(v); setSectionName(v.split('-')[1] || 'A'); }}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {teacher.classes.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Section</Label>
                    <Input value={className.split('-')[1] || section} disabled className="mt-1.5 bg-slate-50" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Subject</Label>
                    <Select value={subjectName} onValueChange={setSubjectName}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={teacher.subject}>{teacher.subject}</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Data Structures">Data Structures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Period</Label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    if (!className || !date || !period || !subjectName) {
                      toast.error('Please complete all required fields');
                      return;
                    }
                    const ok = await fetchStudents();
                    if (ok) setStep('capture');
                  }}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: CAPTURE / UPLOAD */}
        {step === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="card-shadow border-slate-200/80">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Capture or upload classroom photo</h2>
                  <p className="text-sm text-slate-500">AI will detect and recognize student faces.</p>
                </div>

                {!imagePreview ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition text-center min-h-[180px]"
                    >
                      <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <Camera className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Capture Classroom Photo</p>
                        <p className="text-xs text-slate-500 mt-0.5">Use your device camera</p>
                      </div>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition text-center min-h-[180px]"
                    >
                      <div className="h-12 w-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Upload Group Photo</p>
                        <p className="text-xs text-slate-500 mt-0.5">Choose from gallery</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                      <img src={imagePreview} alt="Classroom preview" className="w-full h-48 sm:h-56 object-cover" />
                      <button
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      onClick={runAIRecognition}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold"
                    >
                      <Sparkles className="h-5 w-5" /> Analyze with AI
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Demo Mode helper */}
                <div className="border-t border-slate-200 pt-3 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <p className="text-xs font-medium text-amber-700">Demo Mode — try without a real photo</p>
                  </div>
                  <Button variant="outline" onClick={useSampleImage} className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                    <ImageIcon className="h-4 w-4" /> Use Sample Classroom Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="card-shadow border-slate-200/80 overflow-hidden">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center gap-4 py-8">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-emerald-600"
                    />
                    <ScanFace className="absolute inset-0 m-auto h-7 w-7 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Analyzing classroom image…</p>
                    <p className="text-sm text-slate-500 mt-1">{processingMsg}</p>
                  </div>
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-100"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 text-center">{processingProgress}%</p>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    DEMO AI SIMULATION
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Summary banner */}
            <Card className="card-shadow border-emerald-200 bg-emerald-50/40">
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                    <p className="text-xs text-slate-500">Students Detected</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-700">{recognizedCount}</p>
                    <p className="text-xs text-slate-500">Recognized</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-rose-700">{students.length - recognizedCount}</p>
                    <p className="text-xs text-slate-500">Not Recognized</p>
                  </div>
                </div>
                {anomalyCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-100/70 text-amber-800 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span><strong>{anomalyCount} student{anomalyCount > 1 ? 's' : ''}</strong> flagged with low confidence — manual review recommended.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students list */}
            <Card className="card-shadow border-slate-200/80">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-emerald-600" />
                    Edit Attendance — toggle any student
                  </h3>
                  <span className="text-xs text-slate-500">{presentCount}P · {absentCount}A</span>
                </div>
                <div className="space-y-1.5 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
                  {students.map((s, idx) => (
                    <div
                      key={s.studentId}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                        s.anomalyFlag ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <AvatarWithInitials name={s.studentName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 truncate">{s.studentName}</p>
                          <span className="text-[11px] text-slate-400">Roll #{s.rollNumber}</span>
                          {s.manuallyModified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              Manually modified
                            </span>
                          )}
                          {s.anomalyFlag && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium inline-flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" /> Anomaly
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <RecognitionBadge recognized={s.recognized} confidence={s.confidence} />
                          {s.recognized && <ConfidenceBar value={s.confidence} className="flex-1 max-w-[140px]" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold ${s.status === 'PRESENT' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {s.status === 'PRESENT' ? 'Present' : 'Absent'}
                        </span>
                        <Switch
                          checked={s.status === 'PRESENT'}
                          onCheckedChange={() => toggleStudentStatus(idx)}
                          aria-label={`Toggle ${s.studentName} attendance`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setStep('gps')}
                  className="w-full h-11 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue to GPS Verification <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 5: GPS */}
        {step === 'gps' && (
          <motion.div
            key="gps"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="card-shadow border-slate-200/80">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" /> GPS Location Verification
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Attendance can only be recorded if you are within the school&apos;s GPS radius.
                  </p>
                </div>

                {/* Stylized map */}
                <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-50 border border-slate-200">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  {/* School pin (center) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-200/40 absolute -inset-3 animate-pulse" />
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto relative">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-medium text-emerald-900 mt-1 bg-white/80 px-1.5 py-0.5 rounded">School</p>
                  </div>
                  {/* Device pin (offset) */}
                  {gpsVerified && (
                    <div className="absolute" style={{ top: '38%', left: '58%' }}>
                      <div className="h-7 w-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <span className="text-[10px] font-bold">You</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    DEMO GPS
                  </div>
                </div>

                {!gpsData ? (
                  <div className="space-y-2">
                    <Button onClick={() => verifyGPS(false)} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <MapPin className="h-4 w-4" /> Use Demo Location
                    </Button>
                    <Button variant="outline" onClick={() => verifyGPS(true)} className="w-full h-10 border-rose-200 text-rose-700 hover:bg-rose-50">
                      <AlertCircle className="h-4 w-4" /> Simulate Out-of-Range Location
                    </Button>
                  </div>
                ) : (
                  <div className={`rounded-xl p-4 border ${gpsVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {gpsVerified ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : <AlertCircle className="h-5 w-5 text-rose-700" />}
                      <p className={`text-sm font-semibold ${gpsVerified ? 'text-emerald-900' : 'text-rose-900'}`}>
                        Location Status: {gpsVerified ? 'VERIFIED' : 'FAILED'}
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-700"><span className="text-slate-500">School Location:</span> {SCHOOL_LOCATION.name}</p>
                      <p className="text-slate-700"><span className="text-slate-500">Distance:</span> {gpsData.distance} meters (allowed: {SCHOOL_LOCATION.radiusMeters}m)</p>
                      <p className={`font-medium ${gpsVerified ? 'text-emerald-700' : 'text-rose-700'}`}>{gpsData.status}</p>
                    </div>
                    <Button
                      onClick={() => verifyGPS(false)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs text-slate-500"
                    >
                      Re-verify
                    </Button>
                  </div>
                )}

                <Button
                  onClick={() => setStep('confirm')}
                  disabled={!gpsVerified}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Confirmation <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 6: CONFIRM */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <Card className="card-shadow border-slate-200/80">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Confirm Attendance</h2>
                  <p className="text-sm text-slate-500">Review the details and confirm to save.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Class</p>
                    <p className="text-sm font-semibold text-slate-900">{className}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-900">{format(parseISO(date), 'dd MMMM yyyy')}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Subject</p>
                    <p className="text-sm font-semibold text-slate-900">{subjectName}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Period</p>
                    <p className="text-sm font-semibold text-slate-900">{period}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Total Students</p>
                    <p className="text-sm font-semibold text-slate-900">{students.length}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">GPS Verified</p>
                    <p className="text-sm font-semibold text-emerald-700">Yes · {gpsData?.distance}m</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-700">{presentCount}</p>
                    <p className="text-xs text-emerald-700 font-medium">PRESENT</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center">
                    <p className="text-3xl font-bold text-rose-700">{absentCount}</p>
                    <p className="text-xs text-rose-700 font-medium">ABSENT</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep('results')}
                    variant="outline"
                    className="flex-1 h-11"
                  >
                    <Pencil className="h-4 w-4" /> Edit Attendance
                  </Button>
                  <Button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Confirm & Save</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-10"
          >
            <Card className="card-shadow border-emerald-200 max-w-md w-full">
              <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </svg>
                </motion.div>
                <h2 className="text-lg font-bold text-slate-900">Attendance successfully recorded</h2>
                <p className="text-sm text-slate-500">
                  {presentCount} present, {absentCount} absent for {subjectName} · {className} on {format(parseISO(date), 'dd MMM yyyy')}.
                </p>
                <p className="text-xs text-slate-400">Parents have been notified.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
