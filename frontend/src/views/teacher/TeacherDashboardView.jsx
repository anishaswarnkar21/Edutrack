import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ClassCard } from "../../components/classes/ClassCard.jsx";
import { IconBook, IconPlus, IconAlertCircle } from "../../components/ui/icons.jsx";
import { useClassesViewModel } from "../../viewmodels/useClassesViewModel.js";

export function TeacherDashboardView() {
  const { classes, loading, error, actionError, createClass } = useClassesViewModel();
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createClass(className);
      setClassName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Your classes" description="Manage attendance, lessons, and quizzes for each class." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={IconBook} label="Classes" value={classes.length} />
      </div>

      <Card className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Create a new class</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class name</label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. Grade 10 Biology"
              required
            />
          </div>
          <Button type="submit" loading={creating}>
            <IconPlus className="h-4 w-4" />
            Create class
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
          description="Create your first class above to get a join code for students."
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <ClassCard key={c.id} classRoom={c} showJoinCode />
        ))}
      </div>
    </DashboardLayout>
  );
}
