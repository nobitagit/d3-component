var tape = require("tape"),
    jsdom = require("jsdom"),
    d3 = Object.assign(require("../"), require("d3-selection"));

/*************************************
 ************ Components *************
 *************************************/

// Nesting
var heading = d3.component("h1")
      .render(function (selection, d){ selection.text(d); }),
    paragraph = d3.component("p")
      .render(function (selection, d){ selection.text(d); }),
    post = d3.component("div", "post")
      .render(function (selection, d){
        selection
          .call(heading, d.title)
          .call(paragraph, d.content);
      });

// Containment
var card = d3.component("div", "card")
  .create(function (selection){
    selection
      .append("div").attr("class", "card-block")
      .append("div").attr("class", "card-text");
  })
  .render(function (selection, props){
    selection.select(".card-text")
        .call(props.childComponent, props.childProps);
  });

// Conditional rendering
var apple = d3.component("span", "apple")
    orange = d3.component("span", "orange")
    fruit = d3.component("div", "fruit")
      .render(function (selection, props){
        selection
          .call(apple, props.type === "apple"? {} : [])
          .call(orange, props.type === "orange"? {} : [])
      });


/*************************************
 ************** Tests ****************
 *************************************/
tape("Nesting.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");

  div.call(post, {
    title: "Title",
    content: "Content here."
  });

  test.equal(div.html(), [
    '<div class="post">',
      "<h1>Title</h1>",
      "<p>Content here.</p>",
    "</div>"
  ].join(""));

  test.end();
});

tape("Nesting multiple instances.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");

  // Enter
  div.call(post, [
    { title: "A", content: "a" },
    { title: "B", content: "b" },
  ]);
  test.equal(div.html(), [
    '<div class="post"><h1>A</h1><p>a</p></div>',
    '<div class="post"><h1>B</h1><p>b</p></div>'
  ].join(""));

  // Enter + Update
  div.call(post, [
    { title: "D", content: "d" },
    { title: "E", content: "e" },
    { title: "F", content: "f" },
  ]);
  test.equal(div.html(), [
    '<div class="post"><h1>D</h1><p>d</p></div>',
    '<div class="post"><h1>E</h1><p>e</p></div>',
    '<div class="post"><h1>F</h1><p>f</p></div>'
  ].join(""));

  // Exit
  div.call(post, []);
  test.equal(div.html(), "");

  test.end();
});

tape("Containment.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");
  div.call(card, {
    childComponent: post,
    childProps: [
      { title: "A Title", content: "a content" },
      { title: "B Title", content: "b content" },
    ]
  });
  test.equal(div.html(), [
    '<div class="card">',
      '<div class="card-block">',
        '<div class="card-text">',
          '<div class="post"><h1>A Title</h1><p>a content</p></div>',
          '<div class="post"><h1>B Title</h1><p>b content</p></div>',
        "</div>",
      "</div>",
    "</div>"
  ].join(""));

  test.end();
});

tape("Conditional rendering.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");

  // Enter
  div.call(fruit, [
    { type: "apple" },
    { type: "orange" },
    { type: "apple" },
    { type: "apple" },
    { type: "orange" }
  ]);
  test.equal(div.html(), [
    '<div class="fruit"><span class="apple"></span></div>',
    '<div class="fruit"><span class="orange"></span></div>',
    '<div class="fruit"><span class="apple"></span></div>',
    '<div class="fruit"><span class="apple"></span></div>',
    '<div class="fruit"><span class="orange"></span></div>'
  ].join(""));

  // Update + Exit
  div.call(fruit, [
    { type: "orange" },
    { type: "apple" },
    { type: "apple" }
  ]);
  test.equal(div.html(), [
    '<div class="fruit"><span class="orange"></span></div>',
    '<div class="fruit"><span class="apple"></span></div>',
    '<div class="fruit"><span class="apple"></span></div>'
  ].join(""));

  test.end();
});