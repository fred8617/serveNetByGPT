import { classificationGPT } from "./service-classification-gpt.js";

// classificationGPT({
//   model: "gpt-4-0125-preview",
//   topN: 5,
// });

// classificationGPT({
//   model: "gpt-4-0125-preview",
//   topN: 1,
// });

classificationGPT({
  model: "gpt-3.5-turbo",
  topN: 5,
});

// classificationGPT({
//   model: "gpt-3.5-turbo",
//   topN: 1,
// });
