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
 * Content creation area. Every signed-in user can create their own subjects,
 * units, lessons, topics, flashcards and quiz questions. The Overview and
 * Users tabs remain admin-only. Database policies additionally enforce that
 * users can only modify content they created themselves.
 */
export default function AdminPage() {
  const { isAdmin, refresh } = useAppData();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isAdmin ? "Admin Panel" : "Create Content"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your own subjects, flashcards and quizzes — exactly the way you study.
          </p>
        </div>
        <Badge variant="soft">{isAdmin ? "Admin" : "Creator"}</Badge>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content"><FolderTree className="h-4 w-4" /> Content</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="overview"><Layers3 className="h-4 w-4" /> Overview</TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="users"><Users className="h-4 w-4" /> Users</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="content">
          <AdminForms onDone={refresh} />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="overview">
            <ContentOverview />
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="users">
            <AdminUsersTable />
          </TabsContent>
        )}
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
