const binarySearch = (backups, targetTime) => {
  let low = 0;
  let high = backups.length - 1;
  let result = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = new Date(backups[mid].completedAt);

    if (midTime <= targetTime) {
      result = backups[mid];
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
};

module.exports = binarySearch;