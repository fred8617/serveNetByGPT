const data = require("./checkpoint.json");
const per =
  Object.values(data.results).filter((r) => r.equal).length / data.index;
console.log(per, Object.values(data.results).length);
