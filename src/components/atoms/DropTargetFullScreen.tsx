const DropTargetFullScreen = () => {
  return (
    <div className="w-screen h-[calc(100vh)] bg-tint-primary absolute top-0 left-0 z-[120] flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-5xl font-bold">Drop File Here</h1>
        <div className="text-lg">
          Upload files or folders by dropping them in this window
        </div>
      </div>
    </div>
  );
};

export default DropTargetFullScreen;
