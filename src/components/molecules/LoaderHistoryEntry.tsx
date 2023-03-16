import { DateText, TimelineBullet, TimelineGutterBulletLayer } from "../organisms/SidePanel/ManuscriptSidePanel/Tabs/Timeline";
import Section from "../organisms/SidePanel/ManuscriptSidePanel/Section";

interface LoaderHistoryEntryProps {
    selected: boolean;
}

export default function LoaderHistoryEntry({ selected }: LoaderHistoryEntryProps) {
    
    return (
      <div
        className={`relative ml-6 w-[258px] -mr-6 mt-4 h-[110px] animate-pulse duration-100 opacity-25`}
      >
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
          // footer={() => (
          // <div className="flex flex-row p-2 justify-between items-center gap-2 w-full">
          //     <span className="text-xs font-inter">&nbsp;</span>
          //     <button
          //         className="bg-black hover:bg-neutrals-gray-2 rounded-md py-1 px-2 font-semibold text-xs font-inter"

          //     >
          //         &nbsp;
          //     </button>
          // </div>
          // )}
          className={`h-[110px] history-section`}
          selected={selected}
          containerStyle={{
            boxSizing: "none",
            height: 120,
          }}
        >
          <div
            className={`flex flex-col p-2 dark:bg-muted-900 rounded-lg h-[110px]`}
          >
            <div className="w-full flex flex-row justify-between items-center relative">
              <div className="flex-col">
                <DateText>&nbsp;</DateText>
              </div>

              <div className="relative top-1">
                <div className={`h-[100px] rounded-full bg-gray-500 w-full`} />
              </div>
            </div>
          </div>
        </Section>
      </div>
    );
}
