import * as Yup from "yup";
import { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import cx from "classnames";
import { IconCircleCheck, IconWallet } from "@icons";
import { shortAccount } from "@components/utils";
import { useUser } from "@src/state/user/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { ROR_API_URL, ROR_PID_SCHEMA } from "@src/schema/schema";
import CreateableSelectComponent from "./FormInputs/CreateableSelect";
import {
  FlexColumnAligned,
  FlexRowAligned,
  FlexRowSpaceBetween,
} from "@components/styled";
import PrimaryButton from "../atoms/PrimaryButton";
import axios from "axios";

const rorPidSchema = Yup.object().shape({
  rorpid: ROR_PID_SCHEMA.optional(),
});

export default function PrimaryAffiliation() {
  const { account } = useWeb3React();
  const userProfile = useUser();
  const [isConnected] = useState(false);

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting, errors },
  } = useForm<{ rorPid: string[] }>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      rorPid: userProfile.profile?.rorPid ?? [],
    },
    resolver: yupResolver(rorPidSchema),
  });

  const resolveOrgName = useCallback(async (rorId) => {
    try {
      // const urlParts = rorId?.split("/") ?? [];
      const pid = rorId || ""; // urlParts[urlParts.length - 1];
      const { data: org, status } = await axios.get(`${ROR_API_URL}${pid}`);
      if (status === 200 && org?.name) {
        // setValue("organization", org.name);
        return true;
      }
      return false;
    } catch (e) {
      // setValue("organization", "");
      return false;
    }
  }, []);

  const onSubmit = async (data: string[]) => {
    console.log("submit", data);
    const results = await Promise.all(data.map(resolveOrgName))
    const isValid = results.every(res => res === true);

    console.log("isvalid", isValid);

  };

  console.log("ror", watch("rorPid"), isValid, isDirty, errors.rorPid);
  return (
    <form id="rorPidForm" onSubmit={handleSubmit(onSubmit)}>
      <FlexColumnAligned className="gap-3">
        <button
          type="button"
          className={cx(
            "bg-gray-100 text-gray-900",
            "text-gray-700",
            "flex w-full align-middle bg-neutrals-gray-1 hover:bg-neutrals-gray-2 cursor py-2 px-[18px] border border-[#3C3C3C] rounded-lg text-base dark:text-neutrals-white "
          )}
        >
          <div className="text-sm font-medium text-gray-900 justify-start flex w-full">
            {isConnected ? (
              <div className="text-white flex flex-row items-center gap-2 w-full">
                <IconWallet width={32} className="-mb-1" />{" "}
                <div className="">{shortAccount(account || "")}</div>
                <div className="flex grow justify-end">
                  <IconCircleCheck
                    color={"#00A180"}
                    className="w-8 h-8"
                    fill={"#00A180"}
                  />
                </div>
              </div>
            ) : (
              <div className="text-white flex flex-row items-center gap-2">
                <IconWallet width={32} className="-mb-1" /> Connect to your
                Institution
              </div>
            )}
          </div>
        </button>
        <Controller
          name="rorPid"
          control={control}
          render={({ field }: any) => (
            <CreateableSelectComponent
              label="Add Affiliation ROR PID or Name"
              field={{
                ...field,
                onChange: (val: string[]) => {
                  console.log("onchange", val);
                  setValue("rorPid", val, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                },
              }}
              optional={true}
            />
          )}
        />
        <FlexRowSpaceBetween className="justify-between gap-5 w-full">
          <p className="text-sm text-neutrals-gray-5">Tap enter to add multiple affiliations.</p>
          <a
            className="flex flex-row gap-1 items-center text-sm font-extrabold text-tint-primary hover:text-tint-primary-hover tracking-tight disabled:text-neutrals-gray-4"
            href="https://ror.org/search"
            target="_blank"
            rel="noreferrer"
          >
            Find ROR PID
          </a>
        </FlexRowSpaceBetween>
        {errors.rorPid ? <span>{errors.rorPid?.[0].message || ""}</span> : null}
        {isValid && isDirty ? (
          <FlexRowAligned className="items-center justify-end w-full">
            <PrimaryButton
              disabled={!isValid || isSubmitting}
              className="flex gap-2"
              form="rorPidForm"
            >
              Save Affiliations
            </PrimaryButton>
          </FlexRowAligned>
        ) : null}
      </FlexColumnAligned>
    </form>
  );
}
