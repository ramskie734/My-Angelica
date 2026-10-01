"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderTree, Layers3, Users } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminForms, AdminUsersTable } from "@/components/admin/forms";

/**
 * Admin panel: create subjects / units / lessons / topics (with image upload),
 * manage flashcards and quiz questions, and view users with their progress.
 * Access is additionally enforced by database row-level security.
 */
export default function AdminPage() {
  const { isAdmin, refresh } = useAppData();

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-8 text-center">
          <p className="font-semibold">Admins only</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your administrator to grant your account the admin role.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage all study content.</p>
        </div>
        <Badge variant="soft">Admin</Badge>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content"><FolderTree className="h-4 w-4" /> Content</TabsTrigger>
          <TabsTrigger value="overview"><Layers3 className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4" /> Users</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <AdminForms onDone={refresh} />
        </TabsContent>
        <TabsContent value="overview">
          <ContentOverview />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersTable />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

/** Quick inventory of everything that exists in the content tree. */
function ContentOverview() {
  const { subjects, units, lessons, topics, flashcards } = useAppData();

  const cardsPerTopic = topics.map((t) => ({
    topic: t,
    count: flashcards.filter((c) => c.topic_id === t.id).length
  }));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{subjects.length} subjects</Badge>
          <Badge variant="secondary">{units.length} units</Badge>
          <Badge variant="secondary">{lessons.length} lessons</Badge>
          <Badge variant="secondary">{topics.length} topics</Badge>
          <Badge variant="secondary">{flashcards.length} flashcards</Badge>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {cardsPerTopic.map(({ topic, count }) => (
            <li key={topic.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
              <span className="truncate">{topic.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{count} cards</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
