"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, FileText, Mail, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { findSupportContact } from "@/lib/platform-support";
import type { DigitalAccount, Estate } from "@/lib/supabase";

type ActionType = "cancel" | "memorialize" | "transfer";
type AccountStatus = "not_started" | "letter_drafted" | "sent" | "resolved";

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

const statusLabels: Record<AccountStatus, string> = {
  not_started: "Not started",
  letter_drafted: "Letter drafted",
  sent: "Sent",
  resolved: "Resolved"
};

const statusOptions: AccountStatus[] = [
  "not_started",
  "letter_drafted",
  "sent",
  "resolved"
];

function normalizeAction(value: string | null): ActionType {
  if (value === "cancel" || value === "memorialize" || value === "transfer") {
    return value;
  }

  return "cancel";
}

function normalizeStatus(value: string): AccountStatus {
  if (
    value === "not_started" ||
    value === "letter_drafted" ||
    value === "sent" ||
    value === "resolved"
  ) {
    return value;
  }

  return "not_started";
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
  const [accountList, setAccountList] = useState(accounts);
  const [activeAccount, setActiveAccount] = useState<DigitalAccount | null>(
    null
  );
  const [letter, setLetter] = useState<Letter | null>(null);
  const [error, setError] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const resolvedCount = accountList.filter(
    (account) => normalizeStatus(account.status) === "resolved"
  ).length;
  const progressPercent =
    accountList.length === 0
      ? 0
      : Math.round((resolvedCount / accountList.length) * 100);

  const groups = useMemo(() => {
    return accountList.reduce<Record<string, DigitalAccount[]>>(
      (acc, account) => {
        const category = getCategory(account);
        acc[category] = acc[category] ? [...acc[category], account] : [account];
        return acc;
      },
      {}
    );
  }, [accountList]);

  function updateLocalStatus(accountId: string, status: AccountStatus) {
    setAccountList((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === accountId ? { ...account, status } : account
      )
    );
    setActiveAccount((currentAccount) =>
      currentAccount?.id === accountId
        ? { ...currentAccount, status }
        : currentAccount
    );
  }

  async function persistStatus(accountId: string, status: AccountStatus) {
    updateLocalStatus(accountId, status);

    const response = await fetch("/api/update-account-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        account_id: accountId,
        status
      })
    });

    await readJsonResponse(response);
  }

  async function handleStatusChange(accountId: string, status: AccountStatus) {
    setError("");

    try {
      await persistStatus(accountId, status);
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update status."
      );
    }
  }

  async function draftLetter(account: DigitalAccount) {
    if (!estate) {
      setError("Create an estate first before drafting letters.");
      return;
    }

    setActiveAccount(account);
    setLetter(null);
    setError("");
    setCopied(false);
    setSentTo("");
    setIsDrafting(true);

    try {
      const response = await fetch("/api/draft-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platform_name: account.platform_name,
          action_type: normalizeAction(account.action_taken),
          deceased_name: estate.name,
          date_of_death: estate.date_of_death,
          family_member_name: familyMemberName
        })
      });
      const data = await readJsonResponse<Letter>(response);

      setLetter(data);
      await persistStatus(account.id, "letter_drafted");
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

  async function sendLetter() {
    if (!activeAccount || !letter || !estate) {
      return;
    }

    setError("");
    setSentTo("");
    setIsSending(true);

    try {
      const response = await fetch("/api/send-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platform_name: activeAccount.platform_name,
          subject: letter.subject,
          letter: letter.letter,
          reply_to: estate.email
        })
      });
      const data = await readJsonResponse<{ to: string }>(response);

      setSentTo(data.to);
      await persistStatus(activeAccount.id, "sent");
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Unable to send letter."
      );
    } finally {
      setIsSending(false);
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
    setSentTo("");
  }

  if (accountList.length === 0) {
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
      <Card className="dashboard-card overflow-hidden">
        <div className="border-b bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium opacity-85">Resolution progress</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal">
                {resolvedCount} of {accountList.length} accounts resolved
              </h2>
            </div>
            <span className="text-sm font-medium opacity-90">
              {progressPercent}% complete
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

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
                  const action = normalizeAction(account.action_taken);
                  const status = normalizeStatus(account.status);
                  const supportContact = findSupportContact(
                    account.platform_name
                  );

                  return (
                    <article
                      className="group flex min-h-64 flex-col justify-between rounded-md border bg-background p-4 transition hover:border-primary/40 hover:shadow-md"
                      key={account.id}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold">
                            {account.platform_name}
                          </h3>
                          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {actionLabels[action]}
                          </span>
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          {supportContact?.supportEmail ?? "No email configured"}
                        </p>
                        <div className="mt-4 rounded-md border bg-muted/40 p-3">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Tracker
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            Not started {"->"} Letter drafted {"->"} Sent{" "}
                            {"->"} Resolved
                          </p>
                          <select
                            className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={status}
                            onChange={(event) =>
                              handleStatusChange(
                                account.id,
                                event.target.value as AccountStatus
                              )
                            }
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>
                                {statusLabels[option]}
                              </option>
                            ))}
                          </select>
                        </div>
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
                  {actionLabels[normalizeAction(activeAccount.action_taken)]}{" "}
                  request
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

              {sentTo ? (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Sent to {sentTo}
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
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      onClick={sendLetter}
                      disabled={isSending}
                    >
                      <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                      {isSending ? "Sending..." : "Send now"}
                    </Button>
                    <Button type="button" variant="outline" onClick={copyLetter}>
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      {copied ? "Copied" : "Copy letter"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
