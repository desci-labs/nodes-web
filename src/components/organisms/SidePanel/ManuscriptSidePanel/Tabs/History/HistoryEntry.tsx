import { SpinnerCircularFixed } from "spinners-react";
import Section from "@components/organisms/SidePanel/ManuscriptSidePanel/Section";
import PerfectScrollbar from "react-perfect-scrollbar";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import ReactMarkdown from "react-markdown";
import {
  TimelineBullet,
  TimelineGutterBulletLayer,
  DateText,
} from "./Timeline";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { HistoryEntryProps } from "@src/state/nodes/types";
import { selectHistory } from "@src/state/nodes/history";
import { useSetter } from "@src/store/accessors";

export default function HistoryEntry(historyEntry: HistoryEntryProps) {
  const dispatch = useSetter();
  const { index, data, pending, selected } = historyEntry;
  const { setShowPublicationDetails } = useManuscriptController([]);

  return (
    <div key={index} className="relative">
      <TimelineGutterBulletLayer>
        <TimelineBullet selected={selected}>
          <div
            className={`
            ${selected ? "opacity-100" : "opacity-0"}
            w-2.5 h-2.5
            transition-all ease duration-500
            rounded-full
            bg-white
            dark:bg-black
          `}
          />
        </TimelineBullet>
      </TimelineGutterBulletLayer>
      <Section
        footer={() => (
          <div className="flex flex-row p-2 justify-between items-center gap-2 w-full">
            <span className="text-xs font-inter">Version {index}</span>
            <button
              className="bg-black hover:bg-neutrals-gray-2 rounded-md py-1 px-2 font-semibold text-xs font-inter"
              onClick={() => {
                if (data?.transaction) {
                  dispatch(
                    selectHistory({
                      history: historyEntry,
                      id: index.toString(),
                    })
                  );
                  setShowPublicationDetails(true);
                }
              }}
            >
              View Details
            </button>
          </div>
        )}
        className="history-section"
        selected={selected}
        containerStyle={{
          boxSizing: "none",
        }}
      >
        <div className="flex flex-col p-2 dark:bg-muted-900 rounded-lg">
          <div className="w-full flex flex-row justify-between items-center relative">
            <div className="flex-col">
              <DateText>
                {pending ? (
                  <>
                    <SpinnerCircularFixed
                      size={32}
                      thickness={100}
                      speed={100}
                      color="rgba(110, 171, 177, 1)"
                      secondaryColor="rgba(48, 51, 52, 1)"
                    />
                    <span className="absolute -bottom-6 animate-pulse text-[10px] font-normal">
                      Publishing
                    </span>
                  </>
                ) : (
                  data.title
                )}
              </DateText>
              {(data as any).date ? (
                <span
                  className={`inline-block text-[10px] justify-self-end ${
                    data.transaction ? "" : "w-full block"
                  } text-right flex-col text-neutrals-gray-5`}
                >
                  {new Date(
                    (() => {
                      // debugger;
                      return false;
                    })() || (data as any).date
                  ).toLocaleString()}
                  <br />
                </span>
              ) : null}
            </div>
            {data.author && data.author.id ? (
              <div className="relative top-1">
                <Jazzicon
                  className=""
                  diameter={30}
                  seed={data.author ? jsNumberForAddress(data.author.id) : "--"}
                />
              </div>
            ) : null}
          </div>
          <PerfectScrollbar className="w-full overflow-auto break-all pb-4">
            <ReactMarkdown
              children={data.content}
              className="w-[200px] text-[10.5px]"
            />
          </PerfectScrollbar>
        </div>
      </Section>
    </div>
  );
}
