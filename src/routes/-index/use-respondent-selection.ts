import { useState } from "react";

export function useRespondentSelection() {
  const [selectedRespondentId, setSelectedRespondentId] = useState<string | null>(null);

  const toggleRespondent = (respondentId: string) => {
    setSelectedRespondentId(current => (current === respondentId ? null : respondentId));
  };

  return { selectedRespondentId, selectRespondent: setSelectedRespondentId, toggleRespondent };
}
