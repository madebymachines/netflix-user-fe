import localFont from "next/font/local";

export const gravtrac = localFont({
  variable: "--font-gravtrac",
  src: [
    {
      path: "./fonts/gravtrac-compressed-bd.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/gravtrac-condensed-bd.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const urw = localFont({
  variable: "--font-urw",
  src: [
    { path: "./fonts/URWGeometricThin.otf", weight: "100", style: "normal" },
    {
      path: "./fonts/URWGeometricExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    { path: "./fonts/URWGeometricLight.otf", weight: "300", style: "normal" },
    { path: "./fonts/URWGeometricRegular.otf", weight: "400", style: "normal" },
    { path: "./fonts/URWGeometricMedium.otf", weight: "500", style: "normal" },
    {
      path: "./fonts/URWGeometricSemiBold.otf",
      weight: "600",
      style: "normal",
    },
    { path: "./fonts/URWGeometricBold.otf", weight: "700", style: "normal" },
    {
      path: "./fonts/URWGeometricExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    { path: "./fonts/URWGeometricBlack.otf", weight: "900", style: "normal" },
  ],
  display: "swap",
});


export const vancouver = localFont({
  variable: "--font-vancouver",
  src: [
    {
      path: "./fonts/Vancouver-2.0.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

export const vancouverGothic = localFont({
  variable: "--font-vancouver-gothic",
  src: [
    {
      path: "./fonts/Vancouver-Gothic.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});