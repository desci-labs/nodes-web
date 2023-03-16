import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

const DialogViewer = () => {
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);
  return dialogs.length ? (
    <div
      className="fixed w-screen h-screen bg-[rgba(0,0,0,0.4)] z-[150] top-0"
      onClick={(e) => {
        if (!(e.target as HTMLElement).classList.contains("modal-body")) {
          setTimeout(() => setDialogs(dialogs.slice(1)));
        }
      }}
    >
      {dialogs.map((d) => {
        return (
          <div
            className="modal-body w-80 h-36 bg-white shadow-sm rounded-md flex items-center flex-col justify-center left-[calc(50vw-10rem)] absolute top-32"
            key={d.title}
          >
            <h1>{d.title}</h1>
            <div>{d.message}</div>
            <div>
              {d.actions({
                close: () => {
                  setTimeout(() => setDialogs(dialogs.slice(1)));
                },
              })}
            </div>
          </div>
        );
      })}
    </div>
  ) : null;
};

export default DialogViewer;
