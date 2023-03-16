import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateDraft } from "@src/api";
import { cleanupManifestUrl } from "@src/components/utils";
import { RootState } from "@src/store";
import axios from "axios";
import { nodeReaderSlice, setManifest, setManifestCid } from "./viewer";

export const saveManifestDraft = createAsyncThunk(
  `${nodeReaderSlice.name}/saveManifestDraft`,
  async (
    args: { uuid?: string; onSaveCallback?: () => void },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;
    const { manifest: manifestData, currentObjectId } = state.nodes.nodeReader;

    if (!manifestData) return;
    try {
      const res = await updateDraft({
        manifest: manifestData!,
        uuid: args?.uuid ?? currentObjectId!,
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
      args?.onSaveCallback?.();
    } catch (e) {
      console.log("Error ", e);
    } finally {
    }

    return manifestData;
  }
);
