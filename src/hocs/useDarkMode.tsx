import React, { useState } from "react";

export type DarkModeProps = {
  setDarkMode: (value: boolean) => void;
  darkMode: boolean;
};

const useDarkMode = (WrappedComponent: React.FC<DarkModeProps>) => {
  const [darkMode, setDarkMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  let componentMounted = true;

  React.useEffect(() => {
    if (componentMounted) {
      if (!initialized) {
        if (
          localStorage.theme === "dark" ||
          (!("theme" in localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          setDarkMode(true);
        } else {
          setDarkMode(false);
        }
        if (componentMounted) {
          setInitialized(true);
        }
      } else {
        if (darkMode) {
          document.documentElement.classList.add("dark");
          localStorage.theme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.theme = "light";
        }
      }
    }

    return () => {
      componentMounted = false;
    };
  }, [darkMode, initialized]);

  const hocComponent = ({ ...props }) => (
    <WrappedComponent {...props} darkMode={darkMode} setDarkMode={setDarkMode}>
      {props.children}
    </WrappedComponent>
  );

  return hocComponent;
};

export default useDarkMode;
