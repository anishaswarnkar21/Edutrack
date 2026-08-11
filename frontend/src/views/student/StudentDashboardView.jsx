import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ClassCard } from "../../components/classes/ClassCard.jsx";
import { IconBook, IconArrowRight, IconAlertCircle } from "../../components/ui/icons.jsx";
import { useClassesViewModel } from "../../viewmodels/useClassesViewModel.js";

export function StudentDashboardView() {
  const { classes, loading, error, actionError, joinClass } = useClassesViewModel();
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await joinClass(joinCode);
      setJoinCode("");
    } finally {
      setJoining(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Your classes" description="Track lessons, quizzes, and attendance in one place." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={IconBook} label="Classes joined" value={classes.length} />
      </div>

      <Card className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Join a class</h2>
        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Join code</label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. A7K2QX"
              required
            />
          </div>
          <Button type="submit" loading={joining}>
            Join class
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </form>
        {actionError && (
          <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
            <IconAlertCircle className="h-4 w-4" /> {actionError}
          </div>
        )}
      </Card>

      {loading && <p className="text-sm text-gray-500">Loading classes...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && classes.length === 0 && (
        <EmptyState
          icon={IconBook}
          title="No classes yet"
          description="Ask your teacher for a join code and enter it above."
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <ClassCard key={c.id} classRoom={c} />
        ))}
      </div>
    </DashboardLayout>
  );
}
