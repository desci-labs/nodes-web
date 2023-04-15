import { ResearchObjectV1 } from "@desci-labs/desci-models";
import { updateDraft } from "@src/api";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { cleanupManifestUrl } from "@src/components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setManifest, setManifestCid } from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import axios from "axios";
import { useState } from "react";

export default function useSaveManifest(uuid?: string) {
  const dispatch = useSetter();
  const { currentObjectId } = useNodeReader();
  const [isSaving, setIsSaving] = useState(false);
  const { setShowSavingIndicator } = useManuscriptController([]);

  const saveManifest = async (
    manifestData: ResearchObjectV1,
    onSaveCallback?: () => void
  ) => {
    setIsSaving(true);
    setShowSavingIndicator(true);
    try {
      const res = await updateDraft({
        manifest: manifestData!,
        uuid: uuid ?? currentObjectId!,
      });

      const manifestUrl = cleanupManifestUrl(res.uri || res.manifestUrl);
      if (res.manifestData) {
        dispatch(setManifest(res.manifestData));
      } else {
        const { data } = await axios.get(manifestUrl);
        dispatch(setManifest(data));
      }
      dispatch(setManifestCid(res.uri));
      localStorage.setItem("manifest-url", manifestUrl);
      onSaveCallback && onSaveCallback?.();
    } catch (e) {
      console.log("Error ", e);
    } finally {
      setIsSaving(false);
      setShowSavingIndicator(false);
    }
  };

  return { saveManifest, isSaving };
}
