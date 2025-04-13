import { useState } from "react";

const Example = () => {
  const [count, setCount] = useState(0);
  const countUP = () => {
    setCount(count + 2);
  };
  const countDOWN = () => {
    setCount(count - 1);
  };
  return (
    <>
      <p>現在のカウント数: {count}</p>
      <button onClick={countUP}>+</button>
      <button onClick={countDOWN}>-</button>
    </>
  );
};

export default Example;
