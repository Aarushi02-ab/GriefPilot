import Link from "next/link";
import { Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { createSupabaseClient, type DigitalAccount } from "@/lib/supabase";
import { AccountWorkbench } from "./account-workbench";

export const dynamic = "force-dynamic";

async function getTasks(): Promise<DigitalAccount[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("digital_accounts")
    .select("id, estate_id, platform_name, account_type, status, action_taken")
    .order("platform_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load tasks: ${error.message}`);
  }

  return data ?? [];
}

export default async function DashboardPage() {
  const tasks = await getTasks();

  return (
    <main className="dashboard-page mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="dashboard-heading flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Tasks
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            This is where the family task list will appear as GriefPilot grows.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/onboarding">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Update intake
          </Link>
        </Button>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Task list</CardTitle>
          <CardDescription>
            No tasks have been added yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="divide-y rounded-md border">
              {tasks.map((task) => (
                <li key={task.id} className="px-4 py-3 text-sm">
                  <div className="font-medium">{task.platform_name}</div>
                  <div className="mt-1 text-muted-foreground">
                    {task.account_type ?? "Account"} - {task.status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-muted/40 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-background text-muted-foreground">
                <Inbox className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-normal">
                No tasks yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                The dashboard is ready. Future task generation can fill this
                space with estate, account, benefits, and family coordination
                steps.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountWorkbench />
    </main>
  );
}
