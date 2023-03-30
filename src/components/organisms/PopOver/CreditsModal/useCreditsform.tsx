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

export default function useCreditsform({
  id,
  author,
}: {
  author?: ResearchObjectV1Author;
  id?: number;
}) {
  const {
    watch,
    setValue,
    setFocus,
    formState: { errors, dirtyFields },
  } = useFormContext<AuthorFormValues>();
  const dispatch = useSetter();

  const onSubmit = async (data: ResearchObjectV1Author) => {
    const { name, googleScholar, orcid } = data;
    if (author && id !== undefined) {
      dispatch(
        updateNodeAuthor({
          index: id,
          update: { name, googleScholar, orcid },
        })
      );
    } else {
      dispatch(addNodeAuthor({ name, googleScholar, orcid }));
    }

    await dispatch(
      saveManifestDraft({
        onSucess: () => {
          // props?.onDismiss?.();
        },
        onError: () => {},
      })
    );
  };

  // const orcid = watch("orcid");
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

  useEffect(() => {
    // console.log("ORCid1 Errors", errors.orcid1);
    if (errors.orcid1) {
      setFocus("orcid1");
    } else if (dirtyFields["orcid1"]) {
      updateOrcid();
      setFocus("orcid2");
    }
  }, [dirtyFields, errors.orcid1, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid2) {
      setFocus("orcid2");
    } else if (dirtyFields["orcid2"]) {
      updateOrcid();
      setFocus("orcid3");
    }
  }, [dirtyFields, errors.orcid2, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid3) {
      setFocus("orcid3");
    } else if (dirtyFields["orcid3"]) {
      updateOrcid();
      setFocus("orcid4");
    }
  }, [dirtyFields, errors.orcid3, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid4) {
      setFocus("orcid4");
    } else if (dirtyFields["orcid4"]) {
      updateOrcid();
      setFocus("googleScholar");
    }
  }, [dirtyFields, errors.orcid4, setFocus, updateOrcid]);

  return { onSubmit };
}
