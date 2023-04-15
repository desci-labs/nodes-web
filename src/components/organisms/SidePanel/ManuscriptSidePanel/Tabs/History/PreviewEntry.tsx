import { TimelineBullet, TimelineGutterBulletLayer } from "./Timeline";
import { HistoryEntryProps } from "@src/state/nodes/types";

export default function PreviewEntry(
  historyEntry: HistoryEntryProps & { latest?: boolean }
) {
  const { index, data, selected, latest } = historyEntry;

  return (
    <div key={index} className="relative">
      <TimelineGutterBulletLayer>
        <TimelineBullet
          selected={selected}
          className={`${selected ? "w-3.5 h-3.5" : ""}`}
        >
          <div
            className={`
            ${selected ? "opacity-100" : "opacity-0"}
            w-2 h-2
            transition-all ease duration-500
            rounded-full
            bg-white
            dark:bg-black
          `}
          />
        </TimelineBullet>
      </TimelineGutterBulletLayer>
      <section className="preview history-section">
        <div
          className={`flex flex-col p-2 dark:bg-muted-900 rounded-lg ${
            selected
              ? "border-black dark:border-[white] border-[2px] top-[0px] mb-[-1px]"
              : "dark:hover:border-zinc-500 dark:border-black border mt-[1px]"
          }`}
        >
          <div className="w-full flex flex-row justify-between items-center relative">
            <div className="flex flex-col gap-1">
              <span className="text-md font-inter font-bold inline-block">
                Version {index}
              </span>
              {latest && (
                <span className="text-xs font-inter capitalize inline-block text-state-success">
                  Latest version
                </span>
              )}
              {(data as any).date ? (
                <span
                  className={`inline-block text-[12px] justify-self-end ${
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
          </div>
        </div>
      </section>
    </div>
  );
}
