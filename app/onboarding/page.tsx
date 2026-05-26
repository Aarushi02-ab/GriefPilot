import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEstate } from "./actions";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-primary">Onboarding</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">
          Tell us who GriefPilot is helping you organize for.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          These details will be used to personalize the family dashboard and
          future task guidance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Family intake</CardTitle>
          <CardDescription>
            Start with the basic information. You can refine the plan later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEstate} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Deceased person&apos;s name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_of_death">Date of death</Label>
              <Input
                id="date_of_death"
                name="date_of_death"
                type="date"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Your email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit">
                Continue to dashboard
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
