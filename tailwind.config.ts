import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#171717",
        background: "#FFF",
        borderGray: "#DBDBDB",
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        xs13: "0.8125rem",
      },
    },
  },
  plugins: [typography],
};

export default config;
