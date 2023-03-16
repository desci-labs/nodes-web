import React from "react";
const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPrefs = window.localStorage.getItem("color-theme");
    if (typeof storedPrefs === "string") {
      return storedPrefs;
    }
    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (userMedia.matches) {
      return "dark";
    }
  }
  // If you want to use dark theme as the default, return 'dark' instead
  return "dark";
};
type ThemeContextProps = {
  theme: string;
  setTheme: (val: string) => void;
};
export const ThemeContext = React.createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
});
export const ThemeProvider = ({ initialTheme, children }: any) => {
  const [theme, setTheme] = React.useState(getInitialTheme);
  const rawSetTheme = (rawTheme: string) => {
    const root = window.document.documentElement;
    const isDark = rawTheme === "dark";
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(rawTheme);
    localStorage.setItem("color-theme", rawTheme);
  };
  if (initialTheme) {
    rawSetTheme(initialTheme);
  }
  React.useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
