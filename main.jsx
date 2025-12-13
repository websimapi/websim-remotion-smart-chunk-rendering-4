import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { SinkComposition } from "./composition.jsx";
import { styles } from "./styles.js";
import { useRendering } from "./useRendering.js";
import { DebugPanel } from "./DebugPanel.jsx";
import { ChunkGrid } from "./ChunkGrid.jsx";
import { KitchenSceneInteractive } from "./scene.jsx";
const App = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [showHelpers, setShowHelpers] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [vrAvailable, setVrAvailable] = useState(false);
  const [config, setConfig] = useState({
    duration: 95,
    fps: 30,
    strategy: "auto",
    customFrames: 120,
    customConcurrency: 25,
    combineChunks: false
  });
  const playerRef = useRef(null);
  useEffect(() => {
    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        setVrAvailable(supported);
      });
    }
    const handleKey = (e) => {
      if (e.key === "~" || e.key === "`") {
        setShowDebug((prev) => !prev);
      }
      if (e.key === "Escape") {
        setInteractiveMode(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const {
    stats,
    renderStatus,
    recording,
    recordChunk,
    renderAllChunks
  } = useRendering(config, playerRef);
  if (interactiveMode) {
    return /* @__PURE__ */ jsxDEV("div", { style: styles.fullScreenOverlay, children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          style: styles.exitButton,
          onClick: () => setInteractiveMode(false),
          children: "\u2190 Exit Scene"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 60,
          columnNumber: 9
        }
      ),
      /* @__PURE__ */ jsxDEV(KitchenSceneInteractive, { showHelpers }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 66,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 59,
      columnNumber: 7
    });
  }
  return /* @__PURE__ */ jsxDEV("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { ...styles.header, display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }, children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h1", { style: styles.h1, children: "Remotion Kitchen Scene" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 76,
          columnNumber: 11
        }),
        /* @__PURE__ */ jsxDEV("p", { style: styles.subtitle, children: "Cinematic raytraced rendering pipeline" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 77,
          columnNumber: 11
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 75,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }, children: [
        vrAvailable && /* @__PURE__ */ jsxDEV(
          "button",
          {
            style: styles.vrButtonPrompt,
            onClick: () => setInteractiveMode(true),
            children: [
              /* @__PURE__ */ jsxDEV("span", { style: { fontSize: "20px" }, children: "\u{1F97D}" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 87,
                columnNumber: 15
              }),
              " Enter VR Experience"
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 83,
            columnNumber: 13
          }
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            style: { ...styles.vrButtonPrompt, background: "rgba(255,255,255,0.1)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.2)" },
            onClick: () => setInteractiveMode(true),
            children: [
              /* @__PURE__ */ jsxDEV("span", { children: "\u{1F579}\uFE0F" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 95,
                columnNumber: 13
              }),
              " Launch Interactive Mode"
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 91,
            columnNumber: 11
          }
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 81,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 74,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.grid, children: [
      /* @__PURE__ */ jsxDEV("div", { style: styles.playerWrapper, children: stats.totalFrames > 0 ? /* @__PURE__ */ jsxDEV(
        Player,
        {
          ref: playerRef,
          component: SinkComposition,
          durationInFrames: stats.totalFrames,
          fps: config.fps,
          compositionWidth: 1080,
          compositionHeight: 1920,
          controls: true,
          loop: true,
          muted: recording,
          style: {
            width: "100%",
            maxWidth: "360px",
            aspectRatio: "9/16",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)"
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 105,
          columnNumber: 13
        }
      ) : /* @__PURE__ */ jsxDEV("div", { style: {
        width: "100%",
        maxWidth: "360px",
        aspectRatio: "9/16",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        borderRadius: "10px",
        color: "white"
      }, children: "Invalid Duration" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 123,
        columnNumber: 14
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 103,
        columnNumber: 9
      }),
      showDebug && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV(
          DebugPanel,
          {
            config,
            setConfig,
            stats,
            recording,
            renderAllChunks,
            showHelpers,
            setShowHelpers
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 136,
            columnNumber: 13
          }
        ),
        /* @__PURE__ */ jsxDEV(
          ChunkGrid,
          {
            stats,
            renderStatus,
            recordChunk
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 146,
            columnNumber: 13
          }
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 135,
        columnNumber: 11
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 100,
      columnNumber: 7
    }),
    !showDebug && /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", opacity: 0.3, marginTop: "40px", fontSize: "12px" }, children: [
      "Press ",
      /* @__PURE__ */ jsxDEV("b", { children: "~" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 157,
        columnNumber: 19
      }),
      " to toggle debug & render tools"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 156,
      columnNumber: 9
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 72,
    columnNumber: 5
  });
};
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 164,
  columnNumber: 51
}));
