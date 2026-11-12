"use client";

import { useFormState } from "react-dom";
import { createGoal, createPlan, createReview, updateGoalStatus } from "@/lib/development/actions";
import { FormMessage, SubmitButton, TextField } from "@/components/auth/form";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import type { DevFormState } from "@/lib/development/types";
import type { PlanWithGoals, ReviewRow } from "@/lib/development/queries";

const EMPTY: DevFormState = {};

const GOAL_BADGE: Record<string, StatusKind> = {
  not_started: "draft",
  in_progress: "under_review",
  achieved: "approved",
  deferred: "needs_evidence",
};

export function PlanManager({
  playerId,
  plans,
  reviews,
  canManage,
}: {
  playerId: string;
  plans: PlanWithGoals[];
  reviews: ReviewRow[];
  canManage: boolean;
}) {
  return (
    <div className="space-y-6">
      {canManage ? <NewPlanForm playerId={playerId} /> : null}

      {plans.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-sm text-navy-400">
            No development plan yet. Keep current ability separate from rate of improvement.
          </CardBody>
        </Card>
      ) : (
        plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} playerId={playerId} canManage={canManage} />
        ))
      )}

      <Card>
        <CardHeader
          title="12-week reviews"
          subtitle="Progress over time, not a single score"
        />
        <CardBody className="space-y-4">
          {reviews.length > 0 ? (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-navy-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-navy">{r.cycle_label ?? "Review"}</span>
                    <span className="text-xs text-navy-400">
                      {r.review_date ? new Date(r.review_date).toLocaleDateString("en-GB") : ""}
                    </span>
                  </div>
                  {r.summary ? <p className="mt-1 text-navy-600">{r.summary}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                    {r.technical_trend ? <span>Technical: {r.technical_trend}</span> : null}
                    {r.speed_trend ? <span>Speed: {r.speed_trend}</span> : null}
                    {r.decision_trend ? <span>Decisions: {r.decision_trend}</span> : null}
                  </div>
                  {r.next_cycle_focus ? (
                    <p className="mt-2 text-xs text-navy-400">Next: {r.next_cycle_focus}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-400">No reviews recorded yet.</p>
          )}
          {canManage ? <ReviewForm playerId={playerId} /> : null}
        </CardBody>
      </Card>
    </div>
  );
}

function PlanCard({
  plan,
  playerId,
  canManage,
}: {
  plan: PlanWithGoals;
  playerId: string;
  canManage: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title={plan.title ?? "Development plan"}
        subtitle={
          plan.review_date
            ? `Review ${new Date(plan.review_date).toLocaleDateString("en-GB")}`
            : undefined
        }
      />
      <CardBody className="space-y-3">
        {plan.baseline_note ? <p className="text-sm text-navy-500">{plan.baseline_note}</p> : null}
        {plan.goals.length > 0 ? (
          <ul className="divide-y divide-navy-100">
            {plan.goals.map((g) => (
              <li key={g.id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-navy">{g.attribute}</span>
                  <StatusBadge status={GOAL_BADGE[g.status] ?? "draft"} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-navy-500">
                  {g.baseline ? <span>Baseline: {g.baseline}</span> : null}
                  {g.target ? <span>Target: {g.target}</span> : null}
                  {g.action ? <span>Action: {g.action}</span> : null}
                </div>
                {canManage ? (
                  <div className="mt-2 flex gap-2">
                    {g.status !== "in_progress" ? (
                      <GoalStatusButton
                        goalId={g.id}
                        playerId={playerId}
                        status="in_progress"
                        label="Start"
                      />
                    ) : null}
                    {g.status !== "achieved" ? (
                      <GoalStatusButton
                        goalId={g.id}
                        playerId={playerId}
                        status="achieved"
                        label="Achieved"
                      />
                    ) : null}
                    {g.status !== "deferred" ? (
                      <GoalStatusButton
                        goalId={g.id}
                        playerId={playerId}
                        status="deferred"
                        label="Defer"
                      />
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy-400">No goals yet.</p>
        )}
        {canManage ? <GoalAdder planId={plan.id} playerId={playerId} /> : null}
      </CardBody>
    </Card>
  );
}

function GoalStatusButton({
  goalId,
  playerId,
  status,
  label,
}: {
  goalId: string;
  playerId: string;
  status: string;
  label: string;
}) {
  return (
    <form action={updateGoalStatus.bind(null, goalId, playerId, status)}>
      <Button type="submit" size="sm" variant="ghost" className="px-2 py-1 text-xs">
        {label}
      </Button>
    </form>
  );
}

function NewPlanForm({ playerId }: { playerId: string }) {
  const [state, action] = useFormState(createPlan, EMPTY);
  return (
    <Card>
      <CardHeader title="New development plan" />
      <CardBody>
        <form action={action} className="space-y-3">
          <input type="hidden" name="playerId" value={playerId} />
          <FormMessage error={state.error} message={state.message} />
          <TextField
            label="Title"
            name="title"
            placeholder="Autumn cycle — progression & scanning"
          />
          <TextField
            label="Baseline note"
            name="baselineNote"
            required={false}
            placeholder="Where the player is now"
          />
          <TextField label="Review date" name="reviewDate" type="date" required={false} />
          <SubmitButton>Create plan</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}

function GoalAdder({ planId, playerId }: { planId: string; playerId: string }) {
  const [state, action] = useFormState(createGoal, EMPTY);
  return (
    <form
      action={action}
      className="space-y-2 rounded-lg border border-navy-100 bg-surface-muted/40 p-3"
    >
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="playerId" value={playerId} />
      <FormMessage error={state.error} message={state.message} />
      <div className="grid gap-2 sm:grid-cols-2">
        <TextField label="Attribute" name="attribute" placeholder="Receiving on the half-turn" />
        <TextField
          label="Measurable target"
          name="target"
          required={false}
          placeholder="8/10 clean receptions in games"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <TextField label="Baseline" name="baseline" required={false} placeholder="Current level" />
        <TextField
          label="Training action"
          name="action"
          required={false}
          placeholder="Rondos + scanning cues"
        />
      </div>
      <TextField label="Target date" name="dueDate" type="date" required={false} />
      <SubmitButton>Add goal</SubmitButton>
    </form>
  );
}

function ReviewForm({ playerId }: { playerId: string }) {
  const [state, action] = useFormState(createReview, EMPTY);
  return (
    <form
      action={action}
      className="space-y-2 rounded-lg border border-navy-100 bg-surface-muted/40 p-3"
    >
      <input type="hidden" name="playerId" value={playerId} />
      <FormMessage error={state.error} message={state.message} />
      <div className="grid gap-2 sm:grid-cols-2">
        <TextField
          label="Cycle label"
          name="cycleLabel"
          required={false}
          placeholder="Cycle 1 (weeks 1–12)"
        />
        <TextField label="Review date" name="reviewDate" type="date" required={false} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <TextField
          label="Technical trend"
          name="technicalTrend"
          required={false}
          placeholder="Improving"
        />
        <TextField label="Speed trend" name="speedTrend" required={false} placeholder="Stable" />
        <TextField
          label="Decisions trend"
          name="decisionTrend"
          required={false}
          placeholder="Improving"
        />
      </div>
      <TextField
        label="Summary"
        name="summary"
        required={false}
        placeholder="What changed this cycle"
      />
      <TextField
        label="Next cycle focus"
        name="nextFocus"
        required={false}
        placeholder="Agree next goals"
      />
      <SubmitButton>Record review</SubmitButton>
    </form>
  );
}
