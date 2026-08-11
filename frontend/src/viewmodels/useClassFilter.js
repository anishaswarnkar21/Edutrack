import { useEffect, useState } from "react";
import { useClassesViewModel } from "./useClassesViewModel.js";

// Shared by every "global" page (Attendance/Lessons/Results) that needs to scope
// its data to one of the user's classes. Defaults to the first class once loaded,
// or to `preferredClassId` (e.g. from a ?classId= link) if it's one of theirs.
export function useClassFilter(preferredClassId) {
  const { classes, loading, error } = useClassesViewModel();
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    if (selectedClassId || classes.length === 0) return;

    const preferred = classes.find((c) => c.id === preferredClassId);
    setSelectedClassId(preferred ? preferred.id : classes[0].id);
  }, [classes, selectedClassId, preferredClassId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;

  return { classes, loading, error, selectedClassId, setSelectedClassId, selectedClass };
}
