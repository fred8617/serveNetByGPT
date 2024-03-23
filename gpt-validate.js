import fs from "fs-extra";

const gpt4Results = Object.values(
  fs.readJsonSync("./app/component/gpt-4-0125-preview/top1/checkpoint.json")
    .results
);
const gpt3p5Results = Object.values(
  fs.readJsonSync("./app/component/gpt-3.5-turbo/top1/checkpoint.json").results
);
const gpt3p5FTResults = Object.values(
  fs.readJsonSync(
    "./app/component/ft:gpt-3.5-turbo-0125:personal::948GqbYi/validate/top1/checkpoint.json"
  ).results
);
const gpt3p5FTTestResults = Object.values(
  fs.readJsonSync(
    "./app/component/ft:gpt-3.5-turbo-0125:personal::948GqbYi/test/top1/checkpoint.json"
  ).results
);
const fineTuneData = fs.readJsonSync("./fine-tune.json");
let gpt4TotalRight = 0;
let gpt3p5TotalRight = 0;
let gpt3p5FTTotalRight = 0;
let gpt3p5FTValidateTotal = 0;
let gpt34ValidateTotal = 0;
const exclude = [];
const classifications = Object.keys(fineTuneData).filter(
  (e) => !exclude.includes(e)
);
const gpt3p5NotIn = gpt3p5FTResults.filter(
  (r) => !classifications.includes(r.result)
);
const gpt4NotIn = gpt4Results.filter(
  (r) => !classifications.includes(r.result)
);

Object.entries(fineTuneData)
  .filter(([classification]) => !exclude.includes(classification))
  .forEach(
    ([
      classification,
      { train, trainTotal, validate, validateTotal, test, testTotal },
    ]) => {
      const gpt34Total = validateTotal + trainTotal;
      gpt3p5FTValidateTotal += validateTotal;
      gpt34ValidateTotal += gpt34Total;
      let gpt4ValidateResults = [];
      let gpt3p5ValidateResults = [];
      let gpt3p5FTValidateResults = [];
      validate.forEach(([name, description]) => {
        gpt4ValidateResults.push(
          gpt4Results.find(
            (r) =>
              r.name === name &&
              r.description === description &&
              classifications.includes(r.result)
          )
        );
        gpt3p5ValidateResults.push(
          gpt3p5Results.find(
            (r) =>
              r.name === name &&
              r.description === description &&
              classifications.includes(r.result)
          )
        );
        gpt3p5FTValidateResults.push(
          gpt3p5FTResults.find(
            (r) =>
              r.name === name &&
              r.description === description &&
              classifications.includes(r.result)
          )
        );
      });
      train.forEach(([name, description]) => {
        gpt4ValidateResults.push(
          gpt4Results.find(
            (r) =>
              r.name === name &&
              r.description === description &&
              classifications.includes(r.result)
          )
        );
        gpt3p5ValidateResults.push(
          gpt3p5Results.find(
            (r) =>
              r.name === name &&
              r.description === description &&
              classifications.includes(r.result)
          )
        );
      });
      gpt4ValidateResults = gpt4ValidateResults.filter(Boolean);
      gpt3p5ValidateResults = gpt3p5ValidateResults.filter(Boolean);
      gpt3p5FTValidateResults = gpt3p5FTValidateResults.filter(Boolean);
      const gpt4Right = gpt4ValidateResults.filter((r) => r.equal).length;
      gpt4TotalRight += gpt4Right;
      const gpt4Wrong =
        gpt34Total - gpt4ValidateResults.filter((r) => r.equal).length;
      fineTuneData[classification].gpt4Top1Acc = gpt4Right / gpt34Total;
      fineTuneData[classification].gpt4Right = gpt4Right;
      fineTuneData[classification].gpt4Wrong = gpt4Wrong;
      fineTuneData[classification].gpt4Total = gpt34Total;
      console.log(gpt3p5ValidateResults.filter((r) => r === undefined));
      const gpt3p5Right = gpt3p5ValidateResults.filter((r) => r.equal).length;
      gpt3p5TotalRight += gpt3p5Right;
      const gpt3p5Wrong =
        gpt34Total - gpt3p5ValidateResults.filter((r) => r.equal).length;
      fineTuneData[classification].gpt3p5Top1Acc = gpt3p5Right / gpt34Total;
      fineTuneData[classification].gpt3p5Right = gpt3p5Right;
      fineTuneData[classification].gpt3p5Wrong = gpt3p5Wrong;
      fineTuneData[classification].gpt3p5Total = gpt34Total;
      const gpt3p5FTRight = gpt3p5FTValidateResults.filter(
        (r) => r.equal
      ).length;
      gpt3p5FTTotalRight += gpt3p5FTRight;
      const gpt3p5FTWrong =
        validateTotal - gpt3p5FTValidateResults.filter((r) => r.equal).length;
      fineTuneData[classification].gpt3p5FTTop1Acc =
        gpt3p5FTRight / validateTotal;
      fineTuneData[classification].gpt3p5FTRight = gpt3p5FTRight;
      fineTuneData[classification].gpt3p5FTWrong = gpt3p5FTWrong;
      fineTuneData[classification].gpt3p5FTTotal = validateTotal;
    }
  );
/*********************************** test ********************************/
const testDatas = fs.readJsonSync("./test.json");
const gptEnsembleResults = testDatas
  .filter((e) => !exclude.includes(e.classification))
  .filter((e) => e.classification)
  .map(({ name, description, classification }) => {
    const gpt4Predict = gpt4Results.find(
      (r) => r.name === name && r.description === description
    );
    const gpt3p5Predict = gpt3p5Results.find(
      (r) => r.name === name && r.description === description
    );
    const gpt3p5FTPredict = gpt3p5FTTestResults.find(
      (r) => r.name === name && r.description === description
    );
    const gpt4ResultInClassifiaction = fineTuneData[gpt4Predict.result];
    const gpt3p5ResultInClassifiaction = fineTuneData[gpt3p5Predict.result];
    const gpt3p5FTResultInClassifiaction = fineTuneData[gpt3p5FTPredict.result];
    const gpt4Weight = gpt4ResultInClassifiaction
      ? gpt4ResultInClassifiaction.gpt4Top1Acc *
        (fineTuneData[gpt4Predict.result].gpt4Total / gpt34ValidateTotal)
      : 0;
    const gpt3p5Weight = gpt3p5ResultInClassifiaction
      ? fineTuneData[gpt3p5Predict.result].gpt3p5Top1Acc *
        (fineTuneData[gpt3p5Predict.result].gpt3p5Total / gpt34ValidateTotal)
      : 0;
    const gpt3p5FTWeight = gpt3p5FTResultInClassifiaction
      ? fineTuneData[gpt3p5FTPredict.result].gpt3p5FTTop1Acc *
        (fineTuneData[gpt3p5FTPredict.result].gpt3p5FTTotal /
          gpt3p5FTValidateTotal)
      : 0;
    const finalWeight = Math.max(gpt4Weight, gpt3p5FTWeight);
    let equal;
    switch (finalWeight) {
      case gpt4Weight:
        equal = gpt4Predict.result === classification;
        break;
      //   case gpt3p5Weight:
      //     equal = gpt3p5Predict.result === classification;
      //     break;
      case gpt3p5FTWeight:
        equal = gpt3p5FTPredict.result === classification;
        break;

      default:
        break;
    }
    return {
      name,
      description,
      classification,
      equal,
      gpt4Weight,
      gpt4Predict: gpt4Predict.result,
      gpt3p5Weight,
      gpt3p5Predict: gpt3p5Predict.result,
      gpt3p5FTWeight,
      gpt3p5FTPredict: gpt3p5FTPredict.result,
      finalWeight,
    };
  });

const testRightTotal = gptEnsembleResults.filter((e) => e.equal).length;

fs.writeJsonSync("./lj.json", gptEnsembleResults);

fs.writeJsonSync(
  "./app/component/validate-classifiaction-result.json",
  fineTuneData
);

fs.writeJsonSync("./app/component/validate-top1-result.json", {
  gpt4Top1: gpt4TotalRight / gpt34ValidateTotal,
  gpt3p5Top1: gpt3p5TotalRight / gpt34ValidateTotal,
  gpt3p5FTTop1: gpt3p5FTTotalRight / gpt3p5FTValidateTotal,
  gptEnsemble: testRightTotal / gptEnsembleResults.length,
  validateTotal: gpt34ValidateTotal,
  testTotal: gptEnsembleResults.length,
  gpt3p5NotIn,
  gpt4NotIn,
});
