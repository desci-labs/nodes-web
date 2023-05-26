import { getUserData, updateProfile } from "@src/api";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { UserProfile } from "@src/state/api/types";
import { setUser } from "@src/state/user/userSlice";
import { useSetter } from "@src/store/accessors";
import { useState } from "react";
import toast from "react-hot-toast";

import { ProfileValues } from "@src/components/organisms/Profiler";

interface UseProfileSubmitProps {
  onClose?: () => void;
}

export default function useProfileSubmit(props?: UseProfileSubmitProps) {
  const { onClose } = props || {};
  const dispatch = useSetter();
  const [isSubmitting, setSubmitting] = useState(false);

  const retrieveProfile = async () => {
    const userData = (await getUserData()) as UserProfile;
    dispatch(setUser(userData));
  };

  const onSubmit = async (values: ProfileValues) => {
    setSubmitting(true);
    try {
      await updateProfile(values);
      retrieveProfile();
      api.util.invalidateTags([{ type: tags.user }]);

      toast.success("Profile updated!", {
        position: "top-center",
        duration: 5000,
        style: {
          marginTop: 55,
          borderRadius: "10px",
          background: "#111",
          color: "#fff",
        },
      });
      onClose && onClose();
    } catch (e) {
      console.log("ERROR UPDATING PROFILE", e);
      toast.error(
        "Something went wrong trying to update your profile, please try again",
        {
          position: "top-center",
          duration: 5000,
          style: {
            marginTop: 55,
            borderRadius: "10px",
            background: "#111",
            color: "#fff",
          },
        }
      );
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return { isSubmitting, onSubmit };
}
