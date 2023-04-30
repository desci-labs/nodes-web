const PopoverFooter = (props: any) => {
  return (
    <div className="flex flex-row justify-end gap-4 items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4">
      {props.children}
    </div>
  );
};

export default PopoverFooter;
