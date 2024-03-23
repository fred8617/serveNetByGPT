import fs from "fs-extra";
import chunk from "lodash/chunk.js";
import OpenAI from "openai";
import {
  getDatas,
  getAllClassifications,
  getCheckpoint,
  writeCheckpoint,
  __dirname,
} from "./process-data.js";
const datas = getDatas("./data.csv", 0);
const topN = 1;
const classifications = getAllClassifications(datas);
const topNPrompts = [
  "You are a service classifier.",
  "Give me the classification of the service by the given service name and description.",
  `You must output ${topN} of the classification${
    topN > 1 ? "s" : ""
  } in the category below which you think ${
    topN > 1 ? "are" : "is"
  } the highest probability${
    topN > 1 ? ", and use / to seperate each classification:" : ":"
  }`,
  "\n",
].join(" ");
const dataset = Object.fromEntries(
  classifications.map((clz) => {
    const dataset = datas.filter((e) => e[2] === clz);
    const length = dataset.length;
    const groups = chunk(dataset, Math.round(length * 0.6));
    const train=groups[0];
    const validateAndTest=chunk(groups[1], Math.round(groups[1].length * 0.5))
    const validate=validateAndTest[0];
    const test=validateAndTest[1];
    return [
      clz,
      {
        train,
        trainTotal:train.length,
        test,
        testTotal:test.length,
        validate,
        validateTotal:validate.length,
        total:length,
      },
    ];
  })
);
const jsonName = "./fine-tune.json";
fs.ensureFileSync(jsonName);
fs.writeJSONSync(jsonName, dataset);
const trainDatas = Object.values(dataset)
  .map((d) => d.train)
  .flat();
const testDatas = Object.values(dataset)
  .map((d) => d.test)
  .flat();
const validateDatas=Object.values(dataset)
.map((d) => d.validate)
.flat();
const fullPrompts = topNPrompts + classifications.join("\n");
const trainJson = trainDatas
  .map(([name, description, classification]) =>
    JSON.stringify({
      messages: [
        {
          role: "system",
          content: fullPrompts,
        },
        {
          role: "user",
          content: [
            `Service Name: ${name}`,
            `Description: ${description}`,
          ].join("\n"),
        },
        {
          role: "assistant",
          content: classification,
        },
      ],
    })
  )
  .join("\n");
const filename = "./fine-tune.jsonl";
fs.ensureFileSync(filename);
fs.writeFileSync(filename, trainJson);

const validateJson = validateDatas.map(
  ([name, description, classification]) => ({
    name,
    description,
    classification,
    fullPrompts,
    messages: [
      {
        role: "system",
        content: fullPrompts,
      },
      {
        role: "user",
        content: [`Service Name: ${name}`, `Description: ${description}`].join(
          "\n"
        ),
      },
    ],
  })
);

const validatefilename = "./validate.json";
fs.ensureFileSync(validatefilename);
fs.writeJSONSync(validatefilename, validateJson);

const testJson = testDatas.map(
  ([name, description, classification]) => ({
    name,
    description,
    classification,
    fullPrompts,
    messages: [
      {
        role: "system",
        content: fullPrompts,
      },
      {
        role: "user",
        content: [`Service Name: ${name}`, `Description: ${description}`].join(
          "\n"
        ),
      },
    ],
  })
);

const testfilename = "./test.json";
fs.ensureFileSync(testfilename);
fs.writeJSONSync(testfilename, testJson);
