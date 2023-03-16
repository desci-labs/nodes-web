import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { usePdfReader } from "@src/state/nodes/hooks";
import { useEffect, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import Control from ".";

const Wrapper = styled.div.attrs({
  className: `flex`,
})`
  gap: 0px;
  white-space: nowrap;
  margin-inline-end: 6px;
`;
const PaginationNumeratorInput = styled.input.attrs((props) => ({
  className: "focus:outline-none",
  size: (props.value?.toString().length || 0) + 1,
}))`
  font-family: Mulish, "Segoe UI", Tahoma, sans-serif !important;
  background-color: #191b1c;
  color: white;
  text-align: center;
  width: ${(props) => (props.value?.toString().length || 2) * 12}px;
  min-width: 24px;
  font-size: 13.3333px;
  display: block;
  margin-left: -1px;
  height: 20px;
  padding: 0 0px;
`;
const PaginationDenominator: StyledComponent<
  "p",
  any,
  { totalPages: number; children: string },
  "children"
> = styled.p.attrs((props: { totalPages: number }) => {
  return { children: `/ ${props.totalPages || 0}` as string };
})`
  font-weight: normal;
  font-family: Mulish, "Segoe UI", Tahoma, sans-serif !important;
  font-size: 13px;
  padding-left: 3.5px;
  display: block;
  letter-spacing: 0.4px;
  width: 24px;
`;

interface PaginationControlProps {}

const PaginationControl = (props: PaginationControlProps) => {
  const { pdfCurrentPage, pdfTotalPages } = usePdfReader();

  const { setScrollRef, scrollRef, scrollToPage$ } = useManuscriptController([
    "scrollRef",
    "scrollToPage$",
  ]);
  const [currentPage, setCurrentPage] = useState<string | undefined>();

  useEffect(() => {
    setCurrentPage(`${pdfCurrentPage}`);
  }, [pdfCurrentPage]);

  useEffect(() => {
    if (scrollRef) {
      setScrollRef(scrollRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  const updateHandler = () => {
    const newPageNumber = Math.max(
      Math.min(
        Number(currentPage?.length ? currentPage : pdfCurrentPage),
        pdfTotalPages || 1
      ),
      1
    );
    setCurrentPage(`${newPageNumber}`);
    scrollToPage$.next(newPageNumber);
  };

  return (
    <Control>
      <Wrapper>
        <PaginationNumeratorInput
          value={`${currentPage || 1}`}
          onKeyPress={(e: any) => {
            if (e.key === "Enter") {
              updateHandler();
            }
            const allowedChars = "0123456789";
            const contains = (stringValue: string, charValue: any) => {
              return stringValue.indexOf(charValue) > -1;
            };
            const invalidKey =
              (e.key.length === 1 && !contains(allowedChars, e.key)) ||
              (e.key === "." && contains(e.target.value, "."));
            invalidKey && e.preventDefault();
          }}
          onChange={(event: any) => {
            setCurrentPage(event.target.value);
          }}
          onBlur={updateHandler}
        />
        <PaginationDenominator totalPages={pdfTotalPages || 1} />
      </Wrapper>
    </Control>
  );
};

export default PaginationControl;
