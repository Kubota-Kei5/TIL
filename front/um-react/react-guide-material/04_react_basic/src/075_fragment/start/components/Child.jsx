import "./Child.css";
import React from "react";

const Child = () => {
  return (
    <React.Fragment>
      <div className="component">
        <h3>Hello Component</h3>
      </div>
      <h3>Hello Fragment</h3>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat expedita
        nam hic saepe delectus quaerat excepturi sed earum sequi. Excepturi non
        delectus beatae. Ullam ducimus incidunt provident optio, beatae earum.
      </p>
    </React.Fragment>
  );
};

export default Child;
