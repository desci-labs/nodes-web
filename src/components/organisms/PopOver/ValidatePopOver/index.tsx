import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectV1Validation } from "@desci-labs/desci-models";
import React, { useEffect, useState } from "react";
import PopOver from "..";
import SlideOne from "./SlideOne";
import SlideTwo from "./SlideTwo";

export interface ArcSimple {
  id: number;
  name: string;
  description: string;
}
const ValidatePopOver = (props: any) => {
  const { setValidations } = useManuscriptController(["validations"]);
  const [validationType, setValidationType] = useState<any>();
  const [arc, setArc] = useState<ArcSimple | undefined>();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState<string>("ETH");
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [validation, setValidation] = useState<
    ResearchObjectV1Validation | undefined
  >(undefined);

  useEffect(() => {
    setArc(undefined);
  }, [validationType]);

  const resetState = () => {
    setValidationType(undefined);
    setArc(undefined);
    setAmount(undefined);
    setCurrency("ETH");
    setCurrentSlide(1);
  };

  return (
    <PopOver
      {...props}
      style={{
        width: 375,
        maxWidth: "100%",
        margin: "3rem 0.75rem",
        overflow: "visible",
      }}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      displayCloseIcon={false}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
      onClose={() => {
        resetState();
        props.onClose();
      }}
    >
      {currentSlide === 1 ? (
        <SlideOne
          setValidation={setValidation}
          validationType={validationType}
          setValidationType={setValidationType}
          arc={arc}
          setArc={setArc}
          onClose={() => {
            resetState();
            props.onClose();
          }}
          onSubmit={() => setCurrentSlide(2)}
        />
      ) : (
        <SlideTwo
          arc={arc}
          validation={validation}
          validationType={validationType}
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          setCurrency={setCurrency}
          onClose={() => {
            resetState();
            props.onClose();
          }}
          onSubmit={(data: ResearchObjectV1Validation) => {
            // add validation
            // FIXME: doesnt set validations correctly
            setValidations([data]);
            resetState();
            props.onClose();
          }}
        />
      )}
    </PopOver>
  );
};

export default ValidatePopOver;
