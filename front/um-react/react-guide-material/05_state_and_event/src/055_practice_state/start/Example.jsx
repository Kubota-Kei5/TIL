import { useState } from "react";

const Example = () => {
  const [count, setCount] = useState(0);
  const countUP = () => {
    setCount(count + 1);
  };
  const countDOWN = () => {
    setCount(count - 1);
  };
  return (
    <>
      <h3>練習問題</h3>

      <p>現在のカウント数: {count}</p>
      <button onClick={countUP}>+</button>
      <button onClick={countDOWN}>-</button>
    </>
  );
};

export default Example;
