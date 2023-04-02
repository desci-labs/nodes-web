import { useSetter, useGetter } from "@src/store/accessors";
import {
  reset,
  selectAdminAnalytics,
  fetchAdminAnalytics,
  selectAdminAnalyticsStatus,
} from "@src/state/analytics/analyticsSlice";
import { useEffect } from "react";
import AdminStats from "../atoms/AdminStat";
import prettyBytes from "pretty-bytes";

const AdminAnalyticsScreen = () => {
  const adminAnalytics = useGetter(selectAdminAnalytics);
  const fetchStatus = useGetter(selectAdminAnalyticsStatus);
  const dispatch = useSetter();

  useEffect(() => {
    const cleanupOnUnmount = () => {
      if (fetchStatus === "succeeded") {
        dispatch(reset());
      }
    };
    return cleanupOnUnmount;
  });

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchAdminAnalytics());
    }
  }, [fetchStatus, dispatch]);

  return (
    <div
      className={`h-screen text-white w-screen fixed left-0 pl-16 pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
    >
      <div className="flex flex-col mt-6 items-center ">
        <h1 className="text-xl font-semibold">Admin Analytics</h1>
        <div className="mt-12 flex flex-col gap-12 w-10/12">
          <AdminStats
            title="Today"
            stats={[
              { name: "New Users", stat: `${adminAnalytics.newUsersToday}` },
              { name: "New Nodes", stat: `${adminAnalytics.newNodesToday}` },
              {
                name: "Active Users",
                stat: `${adminAnalytics.activeUsersToday}`,
              },
              { name: "Node Views", stat: `${adminAnalytics.nodeViewsToday}` },
              {
                name: "Uploaded",
                stat: `${prettyBytes(adminAnalytics.bytesToday)}`,
              },
            ]}
          />

          <AdminStats
            title="Last 7 days"
            stats={[
              {
                name: "New Users",
                stat: `${adminAnalytics.newUsersInLast7Days}`,
              },
              {
                name: "New Nodes",
                stat: `${adminAnalytics.newNodesInLast7Days}`,
              },
              {
                name: "Active Users",
                stat: `${adminAnalytics.activeUsersInLast7Days}`,
              },
              {
                name: "Node Views",
                stat: `${adminAnalytics.nodeViewsInLast7Days}`,
              },
              {
                name: "Uploaded",
                stat: `${prettyBytes(adminAnalytics.bytesInLast7Days)}`,
              },
            ]}
          />

          <AdminStats
            title="Last 30 days"
            stats={[
              {
                name: "New Users",
                stat: `${adminAnalytics.newUsersInLast30Days}`,
              },
              {
                name: "New Nodes",
                stat: `${adminAnalytics.newNodesInLast30Days}`,
              },
              {
                name: "Active Users",
                stat: `${adminAnalytics.activeUsersInLast30Days}`,
              },
              {
                name: "Node Views",
                stat: `${adminAnalytics.nodeViewsInLast30Days}`,
              },
              {
                name: "Uploaded",
                stat: `${prettyBytes(adminAnalytics.bytesInLast30Days)}`,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsScreen;
