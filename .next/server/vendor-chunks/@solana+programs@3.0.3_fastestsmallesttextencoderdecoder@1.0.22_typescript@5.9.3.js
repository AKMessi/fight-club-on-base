"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@solana+programs@3.0.3_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.3";
exports.ids = ["vendor-chunks/@solana+programs@3.0.3_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.3"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@solana+programs@3.0.3_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.3/node_modules/@solana/programs/dist/index.node.mjs":
/*!***************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@solana+programs@3.0.3_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.3/node_modules/@solana/programs/dist/index.node.mjs ***!
  \***************************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   isProgramError: () => (/* binding */ isProgramError)\n/* harmony export */ });\n/* harmony import */ var _solana_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @solana/errors */ \"(ssr)/./node_modules/.pnpm/@solana+errors@3.0.3_typescript@5.9.3/node_modules/@solana/errors/dist/index.node.mjs\");\n\n\n// src/program-error.ts\nfunction isProgramError(error, transactionMessage, programAddress, code) {\n  if (!(0,_solana_errors__WEBPACK_IMPORTED_MODULE_0__.isSolanaError)(error, _solana_errors__WEBPACK_IMPORTED_MODULE_0__.SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {\n    return false;\n  }\n  const instructionProgramAddress = transactionMessage.instructions[error.context.index]?.programAddress;\n  if (!instructionProgramAddress || instructionProgramAddress !== programAddress) {\n    return false;\n  }\n  return typeof code === \"undefined\" || error.context.code === code;\n}\n\n\n//# sourceMappingURL=index.node.mjs.map\n//# sourceMappingURL=index.node.mjs.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHNvbGFuYStwcm9ncmFtc0AzLjAuM19mYXN0ZXN0c21hbGxlc3R0ZXh0ZW5jb2RlcmRlY29kZXJAMS4wLjIyX3R5cGVzY3JpcHRANS45LjMvbm9kZV9tb2R1bGVzL0Bzb2xhbmEvcHJvZ3JhbXMvZGlzdC9pbmRleC5ub2RlLm1qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUF3Rjs7QUFFeEY7QUFDQTtBQUNBLE9BQU8sNkRBQWEsUUFBUSxtRkFBdUM7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFMEI7QUFDMUI7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2ZpZ2h0LWNsdWIvLi9ub2RlX21vZHVsZXMvLnBucG0vQHNvbGFuYStwcm9ncmFtc0AzLjAuM19mYXN0ZXN0c21hbGxlc3R0ZXh0ZW5jb2RlcmRlY29kZXJAMS4wLjIyX3R5cGVzY3JpcHRANS45LjMvbm9kZV9tb2R1bGVzL0Bzb2xhbmEvcHJvZ3JhbXMvZGlzdC9pbmRleC5ub2RlLm1qcz9hMjFmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzU29sYW5hRXJyb3IsIFNPTEFOQV9FUlJPUl9fSU5TVFJVQ1RJT05fRVJST1JfX0NVU1RPTSB9IGZyb20gJ0Bzb2xhbmEvZXJyb3JzJztcblxuLy8gc3JjL3Byb2dyYW0tZXJyb3IudHNcbmZ1bmN0aW9uIGlzUHJvZ3JhbUVycm9yKGVycm9yLCB0cmFuc2FjdGlvbk1lc3NhZ2UsIHByb2dyYW1BZGRyZXNzLCBjb2RlKSB7XG4gIGlmICghaXNTb2xhbmFFcnJvcihlcnJvciwgU09MQU5BX0VSUk9SX19JTlNUUlVDVElPTl9FUlJPUl9fQ1VTVE9NKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBpbnN0cnVjdGlvblByb2dyYW1BZGRyZXNzID0gdHJhbnNhY3Rpb25NZXNzYWdlLmluc3RydWN0aW9uc1tlcnJvci5jb250ZXh0LmluZGV4XT8ucHJvZ3JhbUFkZHJlc3M7XG4gIGlmICghaW5zdHJ1Y3Rpb25Qcm9ncmFtQWRkcmVzcyB8fCBpbnN0cnVjdGlvblByb2dyYW1BZGRyZXNzICE9PSBwcm9ncmFtQWRkcmVzcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGNvZGUgPT09IFwidW5kZWZpbmVkXCIgfHwgZXJyb3IuY29udGV4dC5jb2RlID09PSBjb2RlO1xufVxuXG5leHBvcnQgeyBpc1Byb2dyYW1FcnJvciB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubm9kZS5tanMubWFwXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5ub2RlLm1qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@solana+programs@3.0.3_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.3/node_modules/@solana/programs/dist/index.node.mjs\n");

/***/ })

};
;