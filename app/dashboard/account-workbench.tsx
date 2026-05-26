"use client";

import { FormEvent, useMemo, useState } from "react";
import { Copy, FileText, Search, Sparkles } from "lucide-react";

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

type ActionType = "cancel" | "memorialize" | "transfer";

type DiscoveredAccount = {
  platform_name: string;
  category: "streaming" | "social" | "finance" | "shopping" | "work";
  suggested_action: ActionType;
  priority: number;
};

type DraftLetter = {
  subject: string;
  letter: string;
};

const actionLabels: Record<ActionType, string> = {
  cancel: "Cancel",
  memorialize: "Memorialize",
  transfer: "Transfer"
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data as T;
}

export function AccountWorkbench() {
  const [email, setEmail] = useState("");
  const [deceasedName, setDeceasedName] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [familyMemberName, setFamilyMemberName] = useState("");
  const [selectedAccount, setSelectedAccount] =
    useState<DiscoveredAccount | null>(null);
  const [accounts, setAccounts] = useState<DiscoveredAccount[]>([]);
  const [letter, setLetter] = useState<DraftLetter | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => b.priority - a.priority),
    [accounts]
  );

  async function discoverAccounts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLetter(null);
    setCopied(false);
    setIsDiscovering(true);

    try {
      const response = await fetch("/api/discover-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const data = await readJsonResponse<{ accounts: DiscoveredAccount[] }>(
        response
      );

      setAccounts(data.accounts);
      setSelectedAccount(data.accounts[0] ?? null);
    } catch (discoverError) {
      setError(
        discoverError instanceof Error
          ? discoverError.message
          : "Unable to discover accounts."
      );
    } finally {
      setIsDiscovering(false);
    }
  }

  async function draftLetter(account: DiscoveredAccount) {
    setError("");
    setLetter(null);
    setCopied(false);
    setSelectedAccount(account);
    setIsDrafting(true);

    try {
      const response = await fetch("/api/draft-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platform_name: account.platform_name,
          action_type: account.suggested_action,
          deceased_name: deceasedName,
          date_of_death: dateOfDeath,
          family_member_name: familyMemberName
        })
      });
      const data = await readJsonResponse<DraftLetter>(response);

      setLetter(data);
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to draft letter."
      );
    } finally {
      setIsDrafting(false);
    }
  }

  async function copyLetter() {
    if (!letter) {
      return;
    }

    await navigator.clipboard.writeText(
      [`Subject: ${letter.subject}`, "", letter.letter].join("\n")
    );
    setCopied(true);
  }

  const canDraft = deceasedName && dateOfDeath && familyMemberName;

  return (
    <div className="account-workbench grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="h-5 w-5" aria-hidden="true" />
            Discover accounts
          </CardTitle>
          <CardDescription>
            Generate likely services to review from the family member&apos;s
            email context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={discoverAccounts}>
            <div className="grid gap-2">
              <Label htmlFor="discover-email">Email address</Label>
              <Input
                id="discover-email"
                type="email"
                placeholder="jane.doe@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 border-t pt-4">
              <div className="grid gap-2">
                <Label htmlFor="deceased-name">Deceased person&apos;s name</Label>
                <Input
                  id="deceased-name"
                  placeholder="Jane Doe"
                  value={deceasedName}
                  onChange={(event) => setDeceasedName(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dashboard-date-of-death">Date of death</Label>
                <Input
                  id="dashboard-date-of-death"
                  type="date"
                  value={dateOfDeath}
                  onChange={(event) => setDateOfDeath(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="family-member-name">Family member name</Label>
                <Input
                  id="family-member-name"
                  placeholder="Alex Doe"
                  value={familyMemberName}
                  onChange={(event) => setFamilyMemberName(event.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isDiscovering}>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {isDiscovering ? "Discovering..." : "Discover accounts"}
            </Button>
          </form>

          {error ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" aria-hidden="true" />
            Draft letter
          </CardTitle>
          <CardDescription>
            Choose a discovered account and generate a platform-ready request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedAccounts.length > 0 ? (
            <div className="grid gap-3">
              {sortedAccounts.map((account) => (
                <div
                  key={`${account.platform_name}-${account.category}`}
                  className="grid gap-3 rounded-md border p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{account.platform_name}</h3>
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {account.category}
                      </span>
                      <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                        Priority {account.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Suggested action:{" "}
                      {actionLabels[account.suggested_action]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={
                      selectedAccount?.platform_name === account.platform_name
                        ? "default"
                        : "outline"
                    }
                    disabled={!canDraft || isDrafting}
                    onClick={() => draftLetter(account)}
                  >
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isDrafting &&
                    selectedAccount?.platform_name === account.platform_name
                      ? "Drafting..."
                      : "Draft letter"}
                  </Button>
                </div>
              ))}
              {!canDraft ? (
                <p className="text-sm text-muted-foreground">
                  Add the deceased person&apos;s name, date of death, and family
                  member name before drafting.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-muted/40 p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">No discovered accounts yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Run account discovery to populate suggested platforms and draft
                outreach letters from the same workspace.
              </p>
            </div>
          )}

          {letter ? (
            <div className="mt-6 rounded-md border bg-background">
              <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Subject</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {letter.subject}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={copyLetter}>
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-4 text-sm leading-6">
                {letter.letter}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
