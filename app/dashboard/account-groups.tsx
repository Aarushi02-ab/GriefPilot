"use client";

import { useMemo, useState } from "react";
import { Copy, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { DigitalAccount, Estate } from "@/lib/supabase";

type ActionType = "cancel" | "memorialize" | "transfer";

type Letter = {
  subject: string;
  letter: string;
};

const categoryLabels: Record<string, string> = {
  finance: "Finance",
  shopping: "Shopping",
  social: "Social",
  streaming: "Streaming",
  work: "Work"
};

const actionLabels: Record<ActionType, string> = {
  cancel: "Cancel",
  memorialize: "Memorialize",
  transfer: "Transfer"
};

function normalizeAction(value: string): ActionType {
  if (value === "cancel" || value === "memorialize" || value === "transfer") {
    return value;
  }

  return "cancel";
}

function getCategory(account: DigitalAccount) {
  return account.account_type ?? "work";
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data as T;
}

export function AccountGroups({
  accounts,
  estate,
  familyMemberName
}: {
  accounts: DigitalAccount[];
  estate: Estate | null;
  familyMemberName: string;
}) {
  const [activeAccount, setActiveAccount] = useState<DigitalAccount | null>(
    null
  );
  const [letter, setLetter] = useState<Letter | null>(null);
  const [error, setError] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => {
    return accounts.reduce<Record<string, DigitalAccount[]>>((acc, account) => {
      const category = getCategory(account);
      acc[category] = acc[category] ? [...acc[category], account] : [account];
      return acc;
    }, {});
  }, [accounts]);

  async function draftLetter(account: DigitalAccount) {
    if (!estate) {
      setError("Create an estate first before drafting letters.");
      return;
    }

    setActiveAccount(account);
    setLetter(null);
    setError("");
    setCopied(false);
    setIsDrafting(true);

    try {
      const response = await fetch("/api/draft-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platform_name: account.platform_name,
          action_type: normalizeAction(account.status),
          deceased_name: estate.name,
          date_of_death: estate.date_of_death,
          family_member_name: familyMemberName
        })
      });
      const data = await readJsonResponse<Letter>(response);

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

  function closeModal() {
    setActiveAccount(null);
    setLetter(null);
    setError("");
    setCopied(false);
  }

  if (accounts.length === 0) {
    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Discovered accounts</CardTitle>
          <CardDescription>
            Submit onboarding to discover and save likely digital accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            No discovered accounts have been saved yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <section className="grid gap-6">
        {Object.entries(groups).map(([category, categoryAccounts]) => (
          <Card className="dashboard-card" key={category}>
            <CardHeader>
              <CardTitle>{categoryLabels[category] ?? category}</CardTitle>
              <CardDescription>
                {categoryAccounts.length} saved account
                {categoryAccounts.length === 1 ? "" : "s"} to review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryAccounts.map((account) => {
                  const action = normalizeAction(account.status);

                  return (
                    <article
                      className="flex min-h-44 flex-col justify-between rounded-md border bg-background p-4"
                      key={account.id}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold">
                            {account.platform_name}
                          </h3>
                          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {actionLabels[action]}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Prepare a {actionLabels[action].toLowerCase()} request
                          for this platform.
                        </p>
                      </div>
                      <Button
                        className="mt-4"
                        type="button"
                        onClick={() => draftLetter(account)}
                      >
                        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                        Draft letter
                      </Button>
                    </article>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {activeAccount ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div>
                <h2 className="text-xl font-semibold tracking-normal">
                  Letter for {activeAccount.platform_name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {actionLabels[normalizeAction(activeAccount.status)]} request
                </p>
              </div>
              <Button
                aria-label="Close letter modal"
                size="icon"
                type="button"
                variant="ghost"
                onClick={closeModal}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-5">
              {isDrafting ? (
                <div className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  Drafting letter...
                </div>
              ) : null}

              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {letter ? (
                <div className="grid gap-4">
                  <div className="rounded-md border bg-card p-4">
                    <p className="text-sm font-medium">Subject</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {letter.subject}
                    </p>
                  </div>
                  <pre className="whitespace-pre-wrap rounded-md border bg-card p-4 text-sm leading-6">
                    {letter.letter}
                  </pre>
                  <Button type="button" variant="outline" onClick={copyLetter}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    {copied ? "Copied" : "Copy letter"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
