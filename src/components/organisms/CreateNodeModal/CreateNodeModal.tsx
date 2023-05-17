import {
  ResearchObjectV1,
  RESEARCH_OBJECT_NODES_PREFIX,
} from "@desci-labs/desci-models";
import {
  createResearchObjectStub,
  getResearchObjectStub,
  updateDraft,
} from "@src/api";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PlaceholderInput from "@src/components/molecules/FormInputs/PlaceholderInput";
import SelectList from "@src/components/molecules/FormInputs/SelectList";
import Modal from "@src/components/molecules/Modal";
import { cleanupManifestUrl } from "@src/components/utils";
import { app, site } from "@src/constants/routes";
import { api } from "@src/state/api";
import { nodesApi } from "@src/state/api/nodes";
import { tags } from "@src/state/api/tags";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  resetEditNode,
  setComponentStack,
  setCurrentObjectId,
  setManifest,
  setPublicView,
} from "@src/state/nodes/nodeReader";
import { toggleToolbar } from "@src/state/preferences/preferencesSlice";
import { useSetter } from "@src/store/accessors";
import axios from "axios";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManuscriptController } from "../ManuscriptReader/ManuscriptController";
import FieldSelector from "./FieldSelector";
import { PDF_LICENSE_TYPES } from "@src/helper/license";
interface CreateNodeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export default memo(function CreateNodeModal({
  isOpen,
  onDismiss,
}: CreateNodeModalProps) {
  const navigate = useNavigate();
  const dispatch = useSetter();
  const { editingNodeParams } = useNodeReader();

  const [manifestTitle, setManifestTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [editManifest, setEditManifest] = useState<ResearchObjectV1 | null>(
    null
  );
  const [manifestLicense, setManifestLicense] = useState<any>();
  const [researchFields, setResearchFields] = useState<string[]>([]);

  const { setIsAddingComponent } = useManuscriptController();

  useEffect(() => {
    //only applies for edit mode, fetches manifest of target node
    if (!editingNodeParams) return;
    const { title, uuid } = editingNodeParams;
    if (title) setManifestTitle(title);

    async function getManifest() {
      try {
        let targetManifest: ResearchObjectV1;
        // const cid = convertHexToCID(decodeBase64UrlSafeToHex(uuid));
        const { manifestData, uri, manifestUrl } = await getResearchObjectStub(
          "objects/" + uuid
        );
        if (manifestData) {
          targetManifest = manifestData;
        } else {
          const prepManifestUrl = cleanupManifestUrl(uri || manifestUrl);
          const { data } = await axios.get(prepManifestUrl);

          targetManifest = data;
        }
        if (!targetManifest) throw Error("[EDIT NODE]Failed fetching manifest");
        setEditManifest(targetManifest);

        if (targetManifest.defaultLicense) {
          const licenseType = PDF_LICENSE_TYPES.find(
            (l) => l.name === targetManifest.defaultLicense
          );
          if (licenseType) setManifestLicense(licenseType);
        }
        setIsLoading(false);
      } catch (e) {
        console.log(`[EDIT NODE]Failed fetching manifest err: ${e}`);
        setEditManifest(null);
        setManifestTitle("");
        dispatch(resetEditNode());
        setIsLoading(false);
      }
    }
    getManifest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editingNodeParams]);

  useEffect(() => {
    if (isOpen === true) {
      navigate(`${site.app}/start`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onClose = (dontHideToolbar?: boolean) => {
    if (!dontHideToolbar) {
      dispatch(toggleToolbar(false));
    }
    setManifestTitle("");
    setManifestLicense("");
    setEditManifest(null);
    setResearchFields([]);
    dispatch(resetEditNode());
    onDismiss?.();
  };

  useEffect(() => {
    if (isOpen === true) {
      navigate(`${site.app}/nodes/start`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleEdit = useCallback(async () => {
    // debugger;
    setIsLoading(true);
    if (!editingNodeParams || !editingNodeParams.uuid || !editManifest)
      return onClose();
    try {
      editManifest.defaultLicense = manifestLicense.name;
      editManifest.title = manifestTitle;
      editManifest.researchFields = researchFields;

      await updateDraft({
        manifest: editManifest,
        uuid: editingNodeParams.uuid,
      });
      dispatch(api.util.invalidateTags([{ type: tags.nodes }]));
      // if (updateRes.uri) {
      //   console.log("NOde Update", updateRes);
      // }
    } catch (e) {
      console.log(`[EDIT NODE]Failed fetching manifest err: ${e}`);
    } finally {
      setIsLoading(false);
      onDismiss();
      // if (props.onRequestClose) props.onRequestClose({} as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editingNodeParams,
    editingNodeParams,
    manifestLicense,
    manifestTitle,
    researchFields,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onClose}
      $scrollOverlay={true}
      $maxWidth={700}
    >
      <Modal.Header onDismiss={onClose} />
      <div className="px-6 pt-5 pb-2 text-white">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-lg font-bold">Name the Research Node</h1>
        </div>
        <p className="text-neutrals-gray-5 text-sm mb-6">
          Enter the name of your research node. Ideally it would be the title of
          your research report.
        </p>

        <PlaceholderInput
          placeholder={"Research Node Name"}
          value={manifestTitle}
          onChange={(e: any) => {
            setManifestTitle(e.target.value);
          }}
        />
        <hr className="mt-6 mb-6 border-neutrals-gray-3" />
        <h1 className="text-base font-bold">Field of Science</h1>
        <p className="text-neutrals-gray-5 text-sm mb-6">
          Start typing the field of science that best describes your research
          node.
        </p>
        {isOpen && (
          <FieldSelector
            onChange={setResearchFields}
            defaultValues={editManifest?.researchFields}
            placeholder="Field of Science"
          />
        )}
        <hr className="mt-6 mb-6 border-neutrals-gray-3" />
        <h1 className="text-base font-bold">Choose License</h1>
        <p className="text-neutrals-gray-5 text-sm">
          Choose the applicable license for this Research Node. Components you
          add to this Node will automatically inherit this license type, unless
          you edit the Licensing at the component level.
        </p>
        <a
          href="https://creativecommons.org/licenses/"
          rel="noreferrer"
          target="_blank"
          className="text-tint-primary text-sm"
        >
          Learn More
        </a>
        <SelectList
          label="License Type"
          data={PDF_LICENSE_TYPES}
          className="mt-2"
          value={manifestLicense}
          onSelect={(value: any) => setManifestLicense(value)}
        />
        <hr className="mt-6 mb-6 border-neutrals-gray-3" />
      </div>
      <div className="flex flex-row justify-end items-center bg-neutrals-gray-1 border-t border-t-tint-primary rounded-b-md px-4 py-3">
        <PrimaryButton
          disabled={
            !(manifestTitle && researchFields.length > 0 && manifestLicense) ||
            isLoading
          }
          onClick={() => {
            if (editingNodeParams) return handleEdit();
            /**
             * Handle create new node
             */
            setTimeout(async () => {
              setIsLoading(true);
              try {
                const payload = {
                  title: manifestTitle || "",
                  defaultLicense: manifestLicense?.name,
                  researchFields,
                  links: {
                    pdf: [],
                    metadata: [],
                  },
                };
                const ros = await createResearchObjectStub(payload);

                dispatch(setCurrentObjectId(""));
                const ro = (ros as any).node.uuid;

                dispatch(setCurrentObjectId(ro));
                dispatch(
                  setManifest({
                    version: 1,
                    title: manifestTitle || "",
                    defaultLicense: manifestLicense?.name,
                    components: [],
                    authors: [],
                    researchFields,
                  })
                );

                dispatch(setComponentStack([]));
                setIsAddingComponent(true);
                setIsLoading(false);

                onClose();
                setIsLoading(false);

                // refresh node collection
                dispatch(nodesApi.util.invalidateTags([{ type: tags.nodes }]));
                navigate(
                  `${site.app}${app.nodes}/${RESEARCH_OBJECT_NODES_PREFIX}${ro}`
                );

                return;
              } catch (e) {
                console.log("Error", e);
              } finally {
                setIsLoading(false);
              }
            });
            dispatch(setCurrentObjectId(""));
            dispatch(setPublicView(false));
          }}
          className="h-10 text-lg flex gap-2"
        >
          {isLoading ? "Saving" : "Save"}
          {isLoading && <DefaultSpinner color="white" size={24} />}
        </PrimaryButton>
      </div>
    </Modal>
  );
});
