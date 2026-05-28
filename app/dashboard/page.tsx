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
import {
  createSupabaseServerClient,
  type DigitalAccount,
  type Estate
} from "@/lib/supabase";
import { AccountGroups } from "./account-groups";

export const dynamic = "force-dynamic";

async function getEstate(estateId?: string): Promise<Estate | null> {
  if (!estateId) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("estates")
    .select("id, name, email, date_of_death, created_at")
    .eq("id", estateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load estate: ${error.message}`);
  }

  return data;
}

async function getTasks(estateId?: string): Promise<DigitalAccount[]> {
  if (!estateId) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("digital_accounts")
    .select("id, estate_id, platform_name, account_type, status, action_taken")
    .eq("estate_id", estateId)
    .order("platform_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load tasks: ${error.message}`);
  }

  return data ?? [];
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: {
    estateId?: string;
    familyMemberName?: string;
  };
}) {
  const estateId = searchParams?.estateId;
  const familyMemberName = searchParams?.familyMemberName ?? "";
  const [estate, tasks] = await Promise.all([
    getEstate(estateId),
    getTasks(estateId)
  ]);

  return (
    <main className="dashboard-page mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="dashboard-heading dashboard-hero flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Estate command center</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Digital account recovery
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Review discovered accounts, grouped by category, and draft outreach
            letters for each platform.
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
          <CardTitle>Estate summary</CardTitle>
          <CardDescription>
            {estate
              ? `Digital account review for ${estate.name}.`
              : "Start onboarding to create an estate and discover accounts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {estate ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border bg-background p-4">
                <p className="text-sm text-muted-foreground">Deceased</p>
                <p className="mt-1 font-medium">{estate.name}</p>
              </div>
              <div className="rounded-md border bg-background p-4">
                <p className="text-sm text-muted-foreground">Date of death</p>
                <p className="mt-1 font-medium">{estate.date_of_death}</p>
              </div>
              <div className="rounded-md border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  Accounts discovered
                </p>
                <p className="mt-1 font-medium">{tasks.length}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-muted/40 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-background text-muted-foreground">
                <Inbox className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-normal">
                No estate selected
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Use onboarding first so GriefPilot can save the estate and
                discover likely digital accounts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountGroups
        accounts={tasks}
        estate={estate}
        familyMemberName={familyMemberName}
      />
    </main>
  );
}
