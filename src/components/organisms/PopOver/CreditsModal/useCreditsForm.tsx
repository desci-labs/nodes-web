import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import {
  addNodeAuthor,
  saveManifestDraft,
  updateNodeAuthor,
} from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { AuthorFormValues } from "./schema";

export default function useCreditsForm({
  id,
  author,
  onDismiss,
}: {
  author?: ResearchObjectV1Author;
  id?: number;
  onDismiss?: () => void;
}) {
  const {
    watch,
    setValue,
    setFocus,
    formState: { errors, dirtyFields },
  } = useFormContext<AuthorFormValues>();
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

  const orcid1 = watch("orcid1");
  const orcid2 = watch("orcid2");
  const orcid3 = watch("orcid3");
  const orcid4 = watch("orcid4");

  const updateOrcid = useCallback(() => {
    const value = `${orcid1}-${orcid2}-${orcid3}-${orcid4}`;
    let invalid = value.split("-").filter(Boolean).length === 0;
    if (invalid) {
      setValue("orcid", "");
    } else {
      setValue("orcid", value);
    }
  }, [orcid1, orcid2, orcid3, orcid4, setValue]);

  const handleFieldChange = useCallback(
    (
      value: string,
      fieldName: keyof AuthorFormValues,
      nextFieldName: keyof AuthorFormValues
    ) => {
      if (errors[fieldName]) {
        setFocus(fieldName);
      } else if (dirtyFields[fieldName]) {
        if (fieldName.substring(0, 5) === "orcid" && value.length === 4) {
          delete dirtyFields[fieldName];
          updateOrcid();
          setFocus(nextFieldName);
        }
      }
    },
    [dirtyFields, errors, setFocus, updateOrcid]
  );

  useEffect(() => {
    handleFieldChange(orcid1, "orcid1", "orcid2");
  }, [
    dirtyFields,
    errors.orcid1,
    handleFieldChange,
    orcid1,
    setFocus,
    updateOrcid,
  ]);

  useEffect(() => {
    handleFieldChange(orcid2, "orcid2", "orcid3");
  }, [
    dirtyFields,
    errors.orcid2,
    handleFieldChange,
    orcid2,
    setFocus,
    updateOrcid,
  ]);

  useEffect(() => {
    handleFieldChange(orcid3, "orcid3", "orcid4");
  }, [
    dirtyFields,
    errors.orcid3,
    handleFieldChange,
    orcid3,
    setFocus,
    updateOrcid,
  ]);

  useEffect(() => {
    handleFieldChange(orcid4, "orcid4", "googleScholar");
  }, [
    dirtyFields,
    errors.orcid4,
    handleFieldChange,
    orcid4,
    setFocus,
    updateOrcid,
  ]);

  return { onSubmit };
}
