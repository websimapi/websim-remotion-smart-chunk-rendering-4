import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { styles } from "./styles.js";
const DebugPanel = ({
  config,
  setConfig,
  stats,
  recording,
  renderAllChunks,
  showHelpers,
  setShowHelpers
}) => {
  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };
  return /* @__PURE__ */ jsxDEV("div", { style: styles.card, children: [
    /* @__PURE__ */ jsxDEV("h2", { style: { marginBottom: "20px" }, children: "\u2699\uFE0F Video Configuration" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 19,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.controlGroup, children: [
      /* @__PURE__ */ jsxDEV("label", { style: styles.label, children: "Total Duration (seconds)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "number",
          style: styles.input,
          value: config.duration,
          onChange: (e) => handleChange("duration", parseInt(e.target.value) || 0),
          min: "1",
          max: "3600"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 9
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 21,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.controlGroup, children: [
      /* @__PURE__ */ jsxDEV("label", { style: styles.label, children: "Frame Rate (fps)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "number",
          style: styles.input,
          value: config.fps,
          onChange: (e) => handleChange("fps", parseInt(e.target.value) || 0),
          min: "1",
          max: "60"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 34,
          columnNumber: 9
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.controlGroup, children: [
      /* @__PURE__ */ jsxDEV("label", { style: styles.label, children: "Render Strategy" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 44,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          style: styles.input,
          value: config.strategy,
          onChange: (e) => handleChange("strategy", e.target.value),
          children: [
            /* @__PURE__ */ jsxDEV("option", { value: "auto", children: "Auto (Recommended)" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 50,
              columnNumber: 11
            }),
            /* @__PURE__ */ jsxDEV("option", { value: "frames", children: "Custom Frames Per Chunk" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 51,
              columnNumber: 11
            }),
            /* @__PURE__ */ jsxDEV("option", { value: "concurrency", children: "Custom Concurrency" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 52,
              columnNumber: 11
            })
          ]
        },
        void 0,
        true,
        {
          fileName: "<stdin>",
          lineNumber: 45,
          columnNumber: 9
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 43,
      columnNumber: 7
    }),
    config.strategy === "frames" && /* @__PURE__ */ jsxDEV("div", { style: styles.controlGroup, children: [
      /* @__PURE__ */ jsxDEV("label", { style: styles.label, children: "Frames Per Chunk" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 58,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "number",
          style: styles.input,
          value: config.customFrames,
          onChange: (e) => handleChange("customFrames", parseInt(e.target.value) || 0)
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 59,
          columnNumber: 11
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 57,
      columnNumber: 9
    }),
    config.strategy === "concurrency" && /* @__PURE__ */ jsxDEV("div", { style: styles.controlGroup, children: [
      /* @__PURE__ */ jsxDEV("label", { style: styles.label, children: "Concurrency" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 70,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "number",
          style: styles.input,
          value: config.customConcurrency,
          onChange: (e) => handleChange("customConcurrency", parseInt(e.target.value) || 0)
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 71,
          columnNumber: 11
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 69,
      columnNumber: 9
    }),
    /* @__PURE__ */ jsxDEV("div", { style: {
      ...styles.infoBox,
      borderColor: stats.chunkCount > 50 ? "#ff9800" : "#4caf50",
      background: stats.chunkCount > 50 ? "rgba(255, 152, 0, 0.2)" : "rgba(76, 175, 80, 0.2)"
    }, children: stats.chunkCount > 50 ? `\u26A0\uFE0F Warning: ${stats.chunkCount} chunks is high. Consider increasing frames per chunk.` : `\u2705 Optimal: ${stats.chunkCount} chunks. Estimated render time: ~${Math.ceil(stats.chunkCount * 4)}s` }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 80,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("h2", { style: { marginBottom: "20px", marginTop: "30px" }, children: "\u{1F4CA} Render Statistics" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 91,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.stats, children: [
      /* @__PURE__ */ jsxDEV("div", { style: styles.stat, children: [
        /* @__PURE__ */ jsxDEV("span", { style: styles.statValue, children: stats.totalFrames }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 95,
          columnNumber: 11
        }),
        /* @__PURE__ */ jsxDEV("span", { style: styles.statLabel, children: "Total Frames" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 11
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 94,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV("div", { style: styles.stat, children: [
        /* @__PURE__ */ jsxDEV("span", { style: styles.statValue, children: stats.chunkCount }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 99,
          columnNumber: 11
        }),
        /* @__PURE__ */ jsxDEV("span", { style: styles.statLabel, children: "Chunks" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 100,
          columnNumber: 11
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 98,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV("div", { style: styles.stat, children: [
        /* @__PURE__ */ jsxDEV("span", { style: styles.statValue, children: stats.framesPerChunk }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 103,
          columnNumber: 11
        }),
        /* @__PURE__ */ jsxDEV("span", { style: styles.statLabel, children: "Frames/Chunk" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 104,
          columnNumber: 11
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 102,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 93,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("label", { style: styles.checkboxLabel, children: [
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "checkbox",
          style: styles.checkbox,
          checked: config.combineChunks,
          onChange: (e) => handleChange("combineChunks", e.target.checked)
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 109,
          columnNumber: 9
        }
      ),
      "Combine all chunks into one file"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 108,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("label", { style: styles.checkboxLabel, children: [
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "checkbox",
          style: styles.checkbox,
          checked: showHelpers,
          onChange: (e) => setShowHelpers(e.target.checked)
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 119,
          columnNumber: 9
        }
      ),
      "Show Lighting Debug Helpers"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 118,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        style: { ...styles.button, opacity: recording ? 0.5 : 1 },
        onClick: renderAllChunks,
        disabled: recording,
        children: recording ? "\u{1F534} Rendering & Recording..." : config.combineChunks ? "\u{1F3AC} Render & Combine All" : "\u{1F3AC} Client-Side Render All Chunks"
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 128,
        columnNumber: 7
      }
    ),
    /* @__PURE__ */ jsxDEV("p", { style: { marginTop: "10px", fontSize: "12px", opacity: 0.7, textAlign: "center" }, children: config.combineChunks ? "Plays segments sequentially and merges them into a single .webm download." : "Plays video and downloads individual .webm files for each chunk." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 141,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 18,
    columnNumber: 5
  });
};
export {
  DebugPanel
};
