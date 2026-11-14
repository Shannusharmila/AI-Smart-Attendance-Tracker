"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarWithInitials } from "@/components/shared/avatar-with-initials";
import { SectionHeader } from "@/components/shared/section-header";
import { useAppStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { User } from "lucide-react";
import { toast } from "sonner";

export function TeacherProfile() {
  const { currentUser } = useAppStore();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: currentUser.email, password: currentUser.password ?? "", role: "TEACHER" }) });
      const d = await res.json();
      if (d.teacher) { setTeacher(d.teacher); setPhone(d.teacher.phone ?? ""); }
    })();
  }, [currentUser]);

  return (
    <div className="space-y-4">
      <SectionHeader title="My Profile" description="Teacher profile details" icon={User} />

      <Card className="rounded-2xl p-5 sm:p-6 card-shadow">
        <div className="flex items-center gap-4 mb-6">
          <AvatarWithInitials name={currentUser?.name ?? "?"} size="xl" />
          <div>
            <p className="text-xl font-bold">{currentUser?.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Teacher · {teacher?.subject ?? "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={currentUser?.name ?? "—"} />
          <Field label="Email" value={currentUser?.email ?? "—"} />
          <Field label="Subject" value={teacher?.subject ?? "—"} />
          <div>
            <Label>Phone</Label>
            {editing ? (
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            ) : (
              <p className="text-sm font-medium mt-1">{phone || "—"}</p>
            )}
          </div>
          <Field label="Classes Taught" value={(teacher?.classes ?? []).join(", ") || "—"} />
        </div>

        <div className="mt-6 flex gap-2">
          {editing ? (
            <>
              <Button onClick={() => { toast.success("Profile updated (demo)."); setEditing(false); }}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
