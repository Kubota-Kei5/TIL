import { useState } from "react";

const Example = () => {
  const orderObj = { item: "apple", count: 10 };
  const [order, setOrder] = useState(orderObj);
  const changeItem = (e) => {
    setOrder({ ...order, item: e.target.value });
  };
  const countUp = (e) => {
    setOrder({ ...order, count: order.count + 1 });
  };
  const countDown = () => {
    setOrder({ ...order, count: order.count - 1 });
  };
  return (
    <div>
      <h3>練習問題</h3>
      <h3>Item:{order.item}</h3>
      <h3>Count:{order.count}</h3>
      <input type="text" value={order.item} onChange={changeItem} />
      <button onClick={countUp}>+</button>
      <button onClick={countDown}>-</button>
    </div>
  );
};

export default Example;
