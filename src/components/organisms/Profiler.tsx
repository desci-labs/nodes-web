import { useUser } from "@src/state/user/hooks";
import { Organization } from "@src/types/client";
import { memo, PropsWithChildren, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

export interface ProfileValues {
  email?: string;
  name?: string;
  orcid?: string;
  googleScholarUrl?: string;
  organization: Organization[];
}

export function Profiler(props: PropsWithChildren<{}>) {
  const userProfile = useUser();
  const methods = useForm<ProfileValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: userProfile.profile?.name ?? "",
      googleScholarUrl: userProfile.profile?.googleScholarUrl ?? "",
      organization: userProfile.profile?.userOrganization ?? []
    },
  });
  const formProps = useMemo(() => methods, [methods]);
  return <FormProvider {...formProps}>{props.children}</FormProvider>;
}

export default memo(Profiler);
