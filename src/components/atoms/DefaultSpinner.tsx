import { SpinnerCircular } from "spinners-react";

const DefaultSpinner = (props: any) => (
  <SpinnerCircular
    size={100}
    color="rgb(92, 156, 177)"
    secondarycolor={"#333333"}
    {...props}
  />
);

export default DefaultSpinner;
