import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import {
  addNodeAuthor,
  saveManifestDraft,
  updateNodeAuthor,
} from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";

export default function useCreditsForm({
  id,
  author,
  onDismiss,
}: {
  author?: ResearchObjectV1Author;
  id?: number;
  onDismiss?: () => void;
}) {
  const dispatch = useSetter();

  const onSubmit = async (data: ResearchObjectV1Author) => {
    const { name, googleScholar, orcid, role } = data;
    if (author && id !== undefined) {
      dispatch(
        updateNodeAuthor({
          index: id,
          update: { name: name.trim(), role, googleScholar, orcid },
        })
      );
    } else {
      dispatch(
        addNodeAuthor({ name: name.trim(), role, googleScholar, orcid })
      );
    }

    const res = await dispatch(saveManifestDraft({}));
    if (!res.type.includes("rejected")) {
      onDismiss?.();
    }
  };

  return { onSubmit };
}
