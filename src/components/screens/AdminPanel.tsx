import { getUsers, getWaitlist, __adminWaitlistPromote } from "@api/index";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useSetter } from "@src/store/accessors";
import {
  setFooterHidden,
  setHeaderHidden,
} from "@src/state/preferences/preferencesSlice";
import { useEffect, useState } from "react";
import { resetManuscriptController } from "@components/organisms/ManuscriptReader/ManuscriptController";

const AdminPanel = () => {
  const dispatch = useSetter();
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  const init = () => {
    (async () => {
      const data = await getWaitlist();
      setWaitlist(data.waitlist);
    })();

    (async () => {
      const data = await getUsers();
      setUsers(data.users);
    })();
  };

  useEffect(() => {
    dispatch(setHeaderHidden(true));
    dispatch(setFooterHidden(true));

    init();

    return () => {
      dispatch(setHeaderHidden(false));
      dispatch(setFooterHidden(false));
      resetManuscriptController();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) {
    return (
      <div className="bg-black text-white h-screen pt-[56px] flex justify-center items-center">
        <PrimaryButton onClick={() => setShow(true)}>Show Admin</PrimaryButton>
      </div>
    );
  }
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };

  const promote = async (id: string, email: string) => {
    if ((window as any).confirm(`Really promote ${email} to User?`)) {
      await __adminWaitlistPromote(id);
      init();
    }
  };

  return (
    <div className="bg-black text-white h-screen pt-[56px]">
      <h1 className="m-4 ml-2 text-lg">Waitlist ({waitlist.length})</h1>
      <div className="overflow-y-scroll bg-gray-800 text-gray-200">
        {waitlist &&
          waitlist
            .filter((a: any) => a.email)
            .map((a: any, i: number) => {
              return (
                <div className={`p-2 ${i % 2 === 0 ? "bg-gray-600" : ""}`}>
                  <button
                    className="rounded-md bg-orange-500 hover:bg-orange-800 p-2 text-xs mr-1"
                    onClick={() => promote(a.id, a.email)}
                  >
                    Promote to User
                  </button>
                  <span className="w-64 inline-block">{a.email}</span>
                  <span className="text-xs ml-1 text-gray-400">
                    {new Date(a.createdAt).toLocaleString("en-US", options)}
                  </span>
                </div>
              );
            })}
      </div>
      <h1 className="m-4 ml-2 text-lg">Users ({users.length})</h1>
      <div className="overflow-y-scroll bg-gray-800 text-gray-200">
        {users &&
          users
            .filter((a: any) => a.email)
            .map((a: any, i: number) => {
              return (
                <div className={`p-2 ${i % 2 === 0 ? "bg-gray-600" : ""}`}>
                  {a.email}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default AdminPanel;
