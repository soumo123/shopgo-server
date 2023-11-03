const Dealer = require('../models/dealer.model.js')
const Product = require('../models/productModel.js')


const getNextSequentialId = async (ids) => {

  let existingIds = []
  let lastId;
  let idPrefix;
  let idLength = 8;

  if (ids==="SD") {
    idPrefix = "SD";
    lastId = await Dealer.findOne().sort({ _id: -1 });
    existingIds.push(lastId.dealer_id)
  } else {
    idPrefix = "PD";
    lastId = await Product.findOne().sort({ _id: -1 });
    existingIds.push(lastId.productId===undefined ? "" : lastId.productId)
  }

    const maxNumericPart = existingIds.reduce((max, id) => {
    const numericPart = parseInt(id.substring(idPrefix.length), 10);
    return numericPart > max ? numericPart : max;
  }, 0);

  const nextCount = maxNumericPart + 1;
  const paddedCount = String(nextCount).padStart(idLength - idPrefix.length, "0");
  const nextId = idPrefix + paddedCount;

  return nextId;
}














module.exports = getNextSequentialId