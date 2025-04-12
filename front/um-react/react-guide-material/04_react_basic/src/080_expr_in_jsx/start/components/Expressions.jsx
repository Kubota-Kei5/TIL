import "./Expression.css";

const Expression = () => {
  const title = "Expression";
  const arry = ["item1", "item2", "item3"];
  const hello = (arg) => `${arg} Function`;

  return (
    <div className="expression">
      <h3>Hello {title}</h3>
      <h3>{arry}</h3>
      <h3>{hello("Hello")}</h3>
    </div>
  );
};

export default Expression;
