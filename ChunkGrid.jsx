import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { styles } from "./styles.js";
const ChunkGrid = ({ stats, renderStatus, recordChunk }) => {
  return /* @__PURE__ */ jsxDEV("div", { style: { ...styles.card, gridColumn: "1 / -1" }, children: [
    /* @__PURE__ */ jsxDEV("h2", { style: { marginBottom: "20px" }, children: "\u{1F4E6} Chunk Visualization" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 7,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("p", { style: { opacity: 0.8, fontSize: "14px" }, children: "Click a chunk to render/download it individually." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 8,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.chunkGrid, children: [
      Array.from({ length: Math.min(stats.chunkCount, 100) }).map((_, i) => /* @__PURE__ */ jsxDEV(
        "div",
        {
          style: {
            ...styles.chunkBox,
            borderColor: renderStatus[i] === "rendering" ? "#ff9800" : renderStatus[i] === "complete" ? "#4caf50" : "rgba(255, 255, 255, 0.3)",
            background: renderStatus[i] === "rendering" ? "rgba(255, 152, 0, 0.2)" : renderStatus[i] === "complete" ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 255, 255, 0.1)"
          },
          onClick: () => recordChunk(i),
          children: [
            /* @__PURE__ */ jsxDEV("strong", { children: i + 1 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 23,
              columnNumber: 13
            }),
            renderStatus[i] === "complete" && /* @__PURE__ */ jsxDEV("span", { children: "\u2713" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 24,
              columnNumber: 48
            })
          ]
        },
        i,
        true,
        {
          fileName: "<stdin>",
          lineNumber: 14,
          columnNumber: 11
        }
      )),
      stats.chunkCount > 100 && /* @__PURE__ */ jsxDEV("div", { style: styles.chunkBox, children: [
        /* @__PURE__ */ jsxDEV("strong", { children: [
          "+",
          stats.chunkCount - 100
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 29,
          columnNumber: 13
        }),
        /* @__PURE__ */ jsxDEV("span", { children: "more" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 30,
          columnNumber: 13
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 28,
        columnNumber: 11
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 6,
    columnNumber: 5
  });
};
export {
  ChunkGrid
};
