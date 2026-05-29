"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserTable } from "@/components/admin/UserTable";
import { IngestForm } from "@/components/admin/IngestForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRole } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const role   = getRole();

  // Guard: only admins may view this page
  useEffect(() => {
    if (role && role !== "admin") router.replace("/chat");
  }, [role, router]);

  if (role !== "admin") return null;

  return (
    <AppLayout title="Admin">
      <div className="flex flex-col gap-6 max-w-4xl">
        {/* User management */}
        <Card>
          <CardContent className="pt-6">
            <UserTable />
          </CardContent>
        </Card>

        {/* Document ingestion */}
        <Card>
          <CardHeader>
            <CardTitle>Document Ingestion</CardTitle>
            <CardDescription>
              Upload a document to chunk, embed, and store in Pinecone with role-based access control.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IngestForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
