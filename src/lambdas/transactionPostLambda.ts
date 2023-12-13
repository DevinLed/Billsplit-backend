
const addNum = (id, val, val2) => {
  setList((prevList) => {
    const newList = prevList.map((item) => {
      if (item.id === id) {
        const a = parseFloat(item.personOwing, 0);
        const b = parseFloat(val);
        const c = parseFloat(val2);
        const prevalue = a + b;
        const value = prevalue + c;
        return { ...item, personOwing: parseFloat(value).toFixed(2) };
      }
      return item;
    });
    localStorage.setItem("list", JSON.stringify(newList));
    return newList;
  });
  setDisplayAdd(true);
  console.log("this is to add");
};
