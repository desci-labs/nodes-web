/* eslint-disable react-hooks/exhaustive-deps */
import { termsConsent } from "@api/index";
import PrimaryButton from "@components/atoms/PrimaryButton";
import RadioButton from "@components/atoms/RadioButton";
import { FlexRowAligned } from "@components/styled";
import { RadioGroup } from "@headlessui/react";
import React, { useCallback, useImperativeHandle, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import SlideDown from "react-slidedown";
import styled from "styled-components";
import InsetLabelInput from "../../../molecules/FormInputs/InsetLabelInput";
import { SpinnerCircular } from "spinners-react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  ResearchTabs,
  setResearchPanelTab,
  toggleResearchPanel,
} from "@src/state/nodes/viewer";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";

// const GATEWAY_OPTIONS = [
//   {
//     id: 1,
//     name: "DeSci",
//   },
// ];

const SectionTitle = styled.p.attrs({
  className: `text-base font-bold`,
})``;
const SectionText = styled<any>("p").attrs((props) => ({
  className: `text-xs font-medium ${props.className}`,
}))``;

const CheckBox = styled.input.attrs((props) => ({
  type: "checkbox",
  className: `focus:ring-tint-primary h-4 w-4 text-tint-primary border-2 border-tint-primary bg-transparent rounded`,
  name: props.name,
  id: props.name,
}))``;
const CheckBoxText = styled<any>("label").attrs((props) => ({
  for: props.htmlFor,
  className: "cursor-pointer select-none text-xs",
}))`
  margin-left: 0.5rem;
`;

export const SlideDownContainer = styled(SlideDown)<{ overflow?: boolean }>`
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;
  overflow: ${(props) => (props.overflow ? "show" : "hidden")};
`;

const AdditionalInfoForm = React.forwardRef((props: any, ref: any) => {
  // const data = useMemo(() => {
  //   return {
  //     keywords: props.data.keywords?.map(
  //       (k: string) => ({ label: k, value: k })
  //     ),
  //     description: props.data.description,
  //     licenseType: PDF_LICENSE_TYPES.find(({ name }) => name === props.data.licenseType),
  //   }
  // }, [props.data])
  const { control, handleSubmit, register } = props.methods;
  const hasCompetingInterests = useWatch({
    control,
    name: "hasCompetingInterests",
  });
  const isOriginalAuthor = useWatch({
    control,
    name: "isOriginalAuthor",
  });

  const onSubmitHandler = useCallback(
    handleSubmit((data: any) => {
      // data.keywords = data.keywords?.map(({ value }: any) => value)
      // data.licenseType = data.licenseType?.name
      // props.onSubmit(data)
    }),
    [handleSubmit]
  );

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        onSubmitHandler();
      },
    }),
    []
  );

  return (
    <form>
      <p className="text-xs">Are you one of the original contributors?</p>
      <Controller
        name="isOriginalAuthor"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }: any) => (
          <RadioGroup {...field} className="mt-2">
            <FlexRowAligned className="gap-6">
              <RadioGroup.Option value={"yes"}>
                {({ checked }) => (
                  <RadioButton
                    label="Yes"
                    checked={checked}
                    labelClassName="text-sm"
                  />
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value={"no"}>
                {({ checked }) => (
                  <RadioButton
                    label="No"
                    checked={checked}
                    labelClassName="text-sm"
                  />
                )}
              </RadioGroup.Option>
            </FlexRowAligned>
          </RadioGroup>
        )}
      />
      <SlideDownContainer closed={isOriginalAuthor === "no"}>
        <>
          <p className="text-xs mt-5">
            Do you have any competing interests to disclose?
          </p>
          <Controller
            name="hasCompetingInterests"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }: any) => (
              <RadioGroup {...field} className="mt-2">
                <FlexRowAligned className="gap-6">
                  <RadioGroup.Option value={"yes"}>
                    {({ checked }) => (
                      <RadioButton
                        label="Yes"
                        checked={checked}
                        labelClassName="text-sm"
                      />
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value={"no"}>
                    {({ checked }) => (
                      <RadioButton
                        label="No"
                        checked={checked}
                        labelClassName="text-sm"
                      />
                    )}
                  </RadioGroup.Option>
                </FlexRowAligned>
              </RadioGroup>
            )}
          />
        </>
      </SlideDownContainer>
      <SlideDownContainer closed={hasCompetingInterests === "no"}>
        {/* {
              hasCompetingInterests ? ( */}
        <div className="mt-6">
          <Controller
            name="competingInterestsExplanation"
            control={control}
            rules={{
              validate: {
                required: (value: any) => {
                  return hasCompetingInterests === "no" || !!value;
                },
              },
              // deps: ['hasCompetingInterests']
            }}
            render={({ field }: any) => (
              <InsetLabelInput
                label="Specify competing interests"
                multiline
                field={field}
                labelClassName="text-xs"
              />
            )}
          />
        </div>
        {/* ) : null
            } */}
      </SlideDownContainer>
      {/* <div className="py-3">
          <SelectMenu
            data={GATEWAY_OPTIONS}
            label="Choose gateway"
            value={gateway}
            onSelect={(value: any) => setGateway(value)}
          />
        </div> */}
      <SectionTitle style={{ marginTop: 32 }}>
        License Agreements: DeSci Nodes Beta
      </SectionTitle>
      <SectionText className="mt-1 text-xs">
        DeSci Nodes is experimental software in testing. Please respect the
        licensing agreement for the material you decide to upload in DeSci
        Nodes. Please check the boxes below to confirm your acceptance of the
        DeSci Labs{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noreferrer"
          className="text-tint-primary"
        >
          Terms of Service
        </a>
      </SectionText>
      <FlexRowAligned style={{ marginTop: 20 }}>
        <CheckBox {...register("hasAcceptedTerms", { required: true })} />
        <CheckBoxText htmlFor="hasAcceptedTerms">
          I accept the DeSci Labs{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-tint-primary"
          >
            Terms of Service
          </a>
        </CheckBoxText>
      </FlexRowAligned>
      <SlideDownContainer closed={isOriginalAuthor === "no"}>
        <SectionTitle style={{ marginTop: 20 }}>
          Declarations: Original Author
        </SectionTitle>
        <FlexRowAligned style={{ marginTop: 20 }}>
          <CheckBox
            {...register("hasAcceptedDeclarations", {
              required: isOriginalAuthor !== "no",
            })}
          />
          <CheckBoxText htmlFor="hasAcceptedDeclarations">
            I accept all the delarations below:
          </CheckBoxText>
        </FlexRowAligned>
        <ul className="mt-2 ml-10 text-xs gap-2 flex flex-col -indent-4">
          <SectionText as="li">
            I confirm that I and my co-authors are the authors of the Research
            Node
          </SectionText>
          <SectionText as="li">
            I confirm that my co-authors have agreed to the submission of the
            Research Node and the Data and have authorized me to act as their
            agent in relation to its submission
          </SectionText>
          <SectionText as="li">
            I confirm that my co-authors and I have all necessary rights and
            have obtained all necessary permissions and consents to grant the
            rights granted to the Research Node in the license section above
          </SectionText>
          <SectionText as="li">
            I and my co-authors (if any) authorize the use of the materials
            published in this Research Node according to the selected license
            agreements
          </SectionText>
        </ul>
      </SlideDownContainer>
      <SectionTitle style={{ marginTop: 20 }}>
        Declarations: Beta Tester
      </SectionTitle>
      <FlexRowAligned style={{ marginTop: 20 }}>
        <CheckBox
          {...register("hasAcceptedAlphaConditions", { required: true })}
        />
        <CheckBoxText htmlFor="hasAcceptedAlphaConditions">
          This Research Node is only created for testing purposes and DeSci Labs
          reserves the right to delete any content at any time
        </CheckBoxText>
      </FlexRowAligned>
    </form>
  );
});

const CommitAdditionalInfoPopOver = (
  props: ModalProps & { onSuccess: () => void }
) => {
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      hasCompetingInterests: "no",
      isOriginalAuthor: "no",
      competingInterestsExplanation: undefined,
      hasAcceptedTerms: false,
      hasAcceptedAlphaConditions: false,
      // isNihEmployee: false,
      hasAcceptedDeclarations: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useSetter();
  const { currentObjectId } = useNodeReader();

  const close = async () => {
    // setGateway(undefined);
    // setError(undefined);
    // setUrlOrDoi(undefined);
    // setSubType(undefined);

    props.onDismiss?.();
  };

  return (
    <Modal
      $maxWidth={550}
      onDismiss={close}
      isOpen={props.isOpen}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white">
        <Modal.Header title="Additional Information" onDismiss={close} />
        <div className="py-8" style={{ width: 500 }}>
          <AdditionalInfoForm methods={methods} />
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton
          disabled={loading || !methods.formState.isValid}
          className={loading ? "w-[63px] justify-center flex" : ""}
          onClick={async () => {
            setLoading(true);
            try {
              await termsConsent(methods.getValues(), currentObjectId!);
              dispatch(toggleResearchPanel(true));
              dispatch(setResearchPanelTab(ResearchTabs.history));
              props.onSuccess && props.onSuccess();
              close();
            } catch (err) {
              toast.error("Error, please try again", {
                duration: 2000,
                position: "top-center",
                style: {
                  marginTop: 0,
                  borderRadius: "10px",
                  background: "#111",
                  color: "#fff",
                },
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <SpinnerCircular color="white" size={24} />
          ) : (
            "Review before publishing"
          )}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CommitAdditionalInfoPopOver;
