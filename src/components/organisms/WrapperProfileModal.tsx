import { useUser } from "@src/state/user/hooks";
import { memo, PropsWithChildren, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

export interface ProfileValues {
  email?: string;
  name?: string;
  orcid?: string;
  googleScholarUrl?: string;
}

export function WrapperProfileModal(props: PropsWithChildren<{}>) {
  const userProfile = useUser();
  const methods = useForm<ProfileValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: userProfile.profile?.name ?? "",
      googleScholarUrl: userProfile.profile?.googleScholarUrl ?? "",
    },
  });
  const formProps = useMemo(() => methods, [methods]);
  return <FormProvider {...formProps}>{props.children}</FormProvider>;
}

export default memo(WrapperProfileModal);
