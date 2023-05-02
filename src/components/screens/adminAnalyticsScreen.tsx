import { useSetter, useGetter } from "@src/store/accessors";
import {
  reset,
  selectAdminAnalytics,
  fetchAdminAnalytics,
  selectAdminAnalyticsStatus,
} from "@src/state/analytics/analyticsSlice";
import { useEffect, useState } from "react";
import AdminStats from "../atoms/AdminStat";
import prettyBytes from "pretty-bytes";
import PrimaryButton from "../atoms/PrimaryButton";
import axios from "axios";

const AdminAnalyticsScreen = () => {
  const adminAnalytics = useGetter(selectAdminAnalytics);
  const fetchStatus = useGetter(selectAdminAnalyticsStatus);
  const dispatch = useSetter();

  const [loading, setLoading] = useState(true);

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
    } else if (fetchStatus === "succeeded") {
      setLoading(false);
    }
  }, [fetchStatus, dispatch]);

  const handleDownload = () => {
    axios({
      url: `${process.env.REACT_APP_NODES_API}/v1/admin/analytics/csv`,
      method: "GET",
      responseType: "blob", // important
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth")}`,
      },
    }).then((response: any) => {
      const url2 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url2;
      link.setAttribute(
        "download",
        `${window.location.hostname}_analytics_${new Date().getUTCDate()}.csv`
      );
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <div
      className={`h-screen text-white w-screen overflow-y-auto pb-10 fixed left-0 pl-16 pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
    >
      <div className="flex flex-col mt-6 items-center ">
        <h1 className="text-xl font-semibold">Admin Analytics</h1>
        <PrimaryButton onClick={handleDownload}>Download CSV</PrimaryButton>
        <div className="mt-12 flex flex-col gap-12 w-10/12">
          <AdminStats
            title="Today"
            loading={loading}
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
            loading={loading}
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
            loading={loading}
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
