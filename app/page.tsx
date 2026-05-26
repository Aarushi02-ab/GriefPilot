import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card";

const features = [
  {
    title: "Collect the essentials",
    description:
      "Start with the few details every next step depends on: who passed, when, and who is coordinating.",
    icon: FileText
  },
  {
    title: "Keep tasks in one place",
    description:
      "Prepare for account closures, notices, paperwork, and family coordination without losing the thread.",
    icon: CheckCircle2
  },
  {
    title: "Support the family lead",
    description:
      "Give one trusted person a simple dashboard they can return to as responsibilities become clearer.",
    icon: Mail
  }
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-medium text-primary">
            After-loss task guidance
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            GriefPilot helps families organize the practical next steps after a death.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A calm intake flow captures the basic details, then gives the family
            a single place to track what needs attention. The task list is ready
            for future guidance, templates, and reminders.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/onboarding">
                Begin onboarding
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4 border-b pb-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-normal">
                Built for sensitive moments
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The interface stays focused, gentle, and practical so the person
                coordinating the work can make progress without extra noise.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-md border bg-background p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-white/55">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Card className="shadow-none">
            <CardContent className="p-5">
              <p className="text-2xl font-semibold">1</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the deceased person&apos;s basic details.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="p-5">
              <p className="text-2xl font-semibold">2</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirm who should receive updates.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="p-5">
              <p className="text-2xl font-semibold">3</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Land on a dashboard ready for upcoming tasks.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
