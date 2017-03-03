var tape = require("tape"),
    jsdom = require("jsdom"),
    d3 = Object.assign(require("../"), require("d3-selection"));

/*************************************
 ************ Components *************
 *************************************/

// Local state.
var spinnerCreated,
    spinnerDestroyed,
    spinnerTimerState = "",
    spinnerText = "",
    spinnerSetState,
    spinner = d3.component("div")
      .create(function (selection, setState){
        spinnerSetState = setState;
        spinnerCreated++;
        spinnerTimerState = "running";
        setState({
          timer: spinnerTimerState
        });
      })
      .render(function (selection, props, state){
        spinnerText = "Timer is " + state.timer;
        selection.text(spinnerText);
      })
      .destroy(function(state){
        spinnerDestroyed++;
      });

// For checking the default value of the state argument.
var stateValue,
    stateValueCheck = d3.component("div")
      .render(function (selection, props, state){
        stateValue = state;
      });

/*************************************
 ************** Tests ****************
 *************************************/
tape("Local state.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");

  // Create.
  spinnerCreated = spinnerDestroyed = 0;
  div.call(spinner);
  test.equal(spinnerCreated, 1);
  test.equal(spinnerDestroyed, 0);
  test.equal(spinnerTimerState, "running");
  test.equal(spinnerText, "Timer is running");
  test.equal(div.html(), "<div>Timer is running</div>");

  // Re-render on setState(object).
  spinnerCreated = spinnerDestroyed = 0;
  spinnerSetState({
    timer: "running well"
  });
  test.equal(spinnerText, "Timer is running well");
  test.equal(div.html(), "<div>Timer is running well</div>");
  test.equal(spinnerCreated, 0);
  test.equal(spinnerDestroyed, 0);

  // Re-render on setState(function).
  spinnerCreated = spinnerDestroyed = 0;
  spinnerSetState(function (state){
    return {
      timer: state.timer + " enough"
    }
  });
  test.equal(spinnerText, "Timer is running well enough");
  test.equal(div.html(), "<div>Timer is running well enough</div>");
  test.equal(spinnerCreated, 0);
  test.equal(spinnerDestroyed, 0);

  // Destroy.
  spinnerCreated = spinnerDestroyed = 0;
  div.call(spinner, []);
  test.equal(spinnerCreated, 0);
  test.equal(spinnerDestroyed, 1);
  test.equal(spinnerText, "Timer is running well enough");
  test.equal(div.html(), "");

  test.end();
});

tape("State value default.", function(test) {
  var div = d3.select(jsdom.jsdom().body).append("div");
  div.call(stateValueCheck);
  test.equal(typeof stateValue, "object");
  test.equal(Object.keys(stateValue).length, 0);
  test.end();
});
