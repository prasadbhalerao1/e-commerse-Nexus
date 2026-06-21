export const getPaginatedResults = async (model, query = {}, limit = 20, nextCursor = null, sortField = '_id', sortOrder = 1) => {
  const parsedLimit = Math.min(parseInt(limit) || 20, 100);
  
  let filter = { ...query };
  
  if (nextCursor) {
    try {
      const decodedCursor = Buffer.from(nextCursor, 'base64').toString('ascii');
      if (sortField === '_id') {
        filter._id = sortOrder === 1 ? { $gt: decodedCursor } : { $lt: decodedCursor };
      } else {
        const parts = decodedCursor.split('_');
        const cursorVal = parts[0];
        const cursorId = parts[1];
        const val = isNaN(cursorVal) ? cursorVal : Number(cursorVal);
        
        if (sortOrder === 1) {
          filter.$or = [
            { [sortField]: { $gt: val } },
            { [sortField]: val, _id: { $gt: cursorId } }
          ];
        } else {
          filter.$or = [
            { [sortField]: { $lt: val } },
            { [sortField]: val, _id: { $lt: cursorId } }
          ];
        }
      }
    } catch (e) {
      // If cursor format invalid, ignore cursor filter
    }
  }

  const items = await model.find(filter)
    .sort({ [sortField]: sortOrder, _id: sortOrder })
    .limit(parsedLimit + 1);

  const hasNextPage = items.length > parsedLimit;
  if (hasNextPage) {
    items.pop();
  }

  let newCursor = null;
  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    let cursorStr = '';
    if (sortField === '_id') {
      cursorStr = lastItem._id.toString();
    } else {
      cursorStr = `${lastItem[sortField]}_${lastItem._id}`;
    }
    newCursor = Buffer.from(cursorStr).toString('base64');
  }

  return {
    items,
    nextCursor: hasNextPage ? newCursor : null,
    limit: parsedLimit,
    count: items.length
  };
};

export default getPaginatedResults;
