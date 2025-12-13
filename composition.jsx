import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { KitchenSceneCanvas } from "./scene.jsx";
const SinkComposition = () => {
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#050505" }, children: [
    /* @__PURE__ */ jsxDEV(KitchenSceneCanvas, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 9,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV(
      Audio,
      {
        src: "/api%20-%20Sink%20Battle%20-%20Sonauto.ogg",
        volume: 0.8
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 11,
        columnNumber: 7
      }
    ),
    /* @__PURE__ */ jsxDEV(
      Audio,
      {
        src: "/asset_running_water.mp3",
        volume: 0.8,
        loop: true
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 16,
        columnNumber: 7
      }
    ),
    /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none"
        }
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 7
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 8,
    columnNumber: 5
  });
};
export {
  SinkComposition
};
