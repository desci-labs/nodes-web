// const { scale } = require("tailwindcss/defaultTheme");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./node_modules/flowbite/**/*.js", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    cursor: {
      auto: "auto",
      default: "default",
      pointer: "pointer",
      wait: "wait",
      text: "text",
      move: "move",
      "not-allowed": "not-allowed",
      crosshair: "crosshair",
    },
    extend: {
      animation: {
        scaleIn: "scaleIn 100ms ease-out",
        expandOut: "expandOut 350ms ease-out",
        fadeIn: "fadeIn 150ms linear",
        slideFromBottom: "slideFromBottom 150ms ease-in",
        slideFromTop: "slideFromTop 150ms ease-in",
        loadingDots: "loadingDots 500ms linear infinite",
        gradient: "gradients 3s ease infinite",
        wiggle: "wiggle 0.3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        pulsatingGlow: "pulsatingGlow 2.5s ease-in-out 0.2s",
      },
      keyframes: {
        pulsatingGlow: {
          "0%, 100%": {
            boxShadow: "0 0 0px rgba(0, 225, 255, 0.5)",
          },
          "40%, 65%": {
            boxShadow: "0 0 15px rgba(0, 225, 255, 1)",
          },
        },
        gradients: {
          "0%, 100%": {
            "background-position": "0% 30%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(50px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        scaleIn: {
          "0%": {
            transform: "scale(1.5)",
            opacity: "0.2",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        expandOut: {
          "0%": {
            transform: "scale(0)",
            opacity: "0.5",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        slideFromBottom: {
          "0%": {
            transform: "translateY(100%)",
          },
          "100%": {
            transform: "translateY(0%)",
          },
        },
        slideFromTop: {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0%)",
            opacity: "1",
          },
        },
        loadingDots: {
          "0%": {
            "&::after": {
              content: ".",
            },
          },
          "50%": {
            "&::after": {
              content: "..",
            },
          },
          "100%": {
            "&::after": {
              content: "...",
            },
          },
        },
        fadeIn: {
          "0%": {
            // height: 0,
            opacity: 0.3,
          },
          "100%": {
            // height: "max-content",
            opacity: 1,
          },
        },
      },
      colors: {
        slate: "rgb(20, 25, 40)",
        primary: "rgb(82, 168, 193)",
        "success-pending": "#ffc01e",
        success: "rgb(0, 161, 128)",
        superblue: "#2772E0",
        "neutrals-gray-1": "#272727",
        "neutrals-gray-2": "#333333",
        "neutrals-gray-3": "#525659",
        "neutrals-gray-4": "#757575",
        "neutrals-gray-5": "#969696",
        "neutrals-gray-6": "#C3C3C3",
        "neutrals-gray-7": "#D8D8D8",
        "neutrals-gray-8": "#EFEFEF",
        "neutrals-black": "#191B1C",
        "neutrals-black-2": "#232323",
        "states-error": "#C96664",
        "states-success": "#00A180",
        "tint-primary": "#28AAC4",
        "tint-primary-hover": "#77DDE4",
        "tint-primary-dark": "#238396",
        "light-gray": "#e9e9e9",
        "dark-gray": "rgb(35,35,35)",
        "medium-gray": "rgb(51, 51, 51)",
        "state-success": "#00A180",
        "state-pending": "#FFC01E",
        "state-error": "#C96664",
        muted: {
          100: "#969696",
          200: "#cccccc",
          300: "#969696",
          400: "rgb(83, 86, 89)",
          500: "rgb(51, 51, 51)",
          600: "#969696",
          700: "rgb(39,39,39)",
          800: "rgb(35,35,35)",
          900: "rgb(25,27,28)",
        },
      },
      fontFamily: {
        sans: ["Karla", ...defaultTheme.fontFamily.sans],
        latex: ["RomanSerif", ...defaultTheme.fontFamily.sans],
        roboto: ["Roboto", ...defaultTheme.fontFamily.sans],
        pdf: ["Mulish", '"Segoe UI"', "Tahoma", "sans-serif"],
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        upperTealShadow: "inset 0px 1px 0 0 rgba(40, 170, 196, 1)",
      },
      minWidth: {
        "49xl": "490xl",
        ...defaultTheme.width,
      },
      minHeight: {
        "49xl": "490xl",
        ...defaultTheme.height,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("flowbite/plugin"),
    require("@tailwindcss/line-clamp"),
    require("tailwindcss-animate"),
  ],
};
