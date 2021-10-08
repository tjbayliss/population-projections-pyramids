/*





  NAME: onload 
  DESCRIPTION: function called when user loads window. Called on initial opening of visualsation.
                Calls functions necessary to set-up initial view
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: body tag in index.html
  CALLS:  alertSize()
          loadData()
          addLineSelectionLists()
          addDotSelectionLists()
          buildControls()
  */
function onload() {
  alertSize(); // function call to get current browser window dimensions
  loadData(); // function call to load initial CSV data file

  aleph.pyramids.forEach(function (d, i) {
    // call function to add new selection lists

    addPyramidSelectionLists(d);
  }); // end forEach

  setPyramidDefaultAllSelected(); // function to default all bootstrap selection lists across charts
  addSVGtoSliders();

  var pyramidLists = ["ethnicities", "regions"];

  aleph.pyramids.forEach(function (d, i) {
    var side = d;

    // d3.selectAll(".aleph-chart-container.aleph-pyramid-chart-container")
    //   .append("label")
    //   .attr("class", "aleph-currentSelection-Lists " + side)
    //   .style("position", "absolute")
    //   .style("left", function () {
    //     if (side == "left") {
    //       return "10%";
    //     } else {
    //       return "90%";
    //     }
    //   })
    //   .style("top", "0px")
    //   .style("text-anchor", function(){
    //     if (side == "left") {
    //       return "start";
    //     } else {
    //       return "end";
    //     }
    //   })
    //   .html(function () {
    //     var string = "";

    //     for (var list in aleph.pyramidCurrentScenarios[side]) {
    //       var listToProcess = aleph.pyramidCurrentScenarios[side][list];
    //       string =
    //         string +
    //         "</br></br><span class='selectionListHeading'>" +
    //         toTitleCase(list) +
    //         "</span>";
    //       listToProcess.forEach(function (d) {
    //         string = string + "<li>" + aleph.selectionLists[list][d - 1];
    //       });
    //     }
    //     return string;
    //   });

    pyramidLists.forEach(function (d, i) {
      var list = d;
      d3.selectAll("." + list + "-selections-" + side).text("All " + list);
    });
  });

  aleph.pyramidOnload = false;
  aleph.lineOnload = false;

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;

  // update dimensions of base container SVG panel to size of browser window
  d3.selectAll(".aleph-chart.aleph-line-chart").attr(
    "width",
    aleph.windowWidth
  );

  svgWidth = $(".aleph-chart.aleph-pyramid-chart").width();
  svgHeight = $(".aleph-chart.aleph-pyramid-chart").height();

  d3.select("#aleph-pyramid-chart")
    .append("text")
    .attr("class", "aleph-main-yearLabel")
    .attr("x", svgWidth / 2)
    .attr("y", 165)
    .text(aleph.pyramidYear);

  return;
} // end function onload

/*
          
          
          
          

    NAME: addSVGtoSliders 
    DESCRIPTION: function called to  
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: onload
    CALLS:  
*/
function addSVGtoSliders() {
  d3.selectAll(".ui-slider-svg-cover").remove();

  // white-filled, grey bordered SVG rectangle covering for base slider DIV
  d3.selectAll(".ui-slider")
    .append("svg")
    .attr("class", "ui-slider-svg ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("rect")
    .attr("class", "ui-slider-svg-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-range.ui-corner-all.ui-widget-header")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-handle")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0)
    .append("circle")
    .attr("class", "ui-slider-svg-circle")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  d3.select("#pyramid-slider")
    .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
    .style("left", "0.33%");

  return;
} // end function addSVGtoSliders

/*
          
          
          
          

    NAME: loadData 
    DESCRIPTION: function called to load CSV input data file(s).
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: none
    CALLS: drawLineChart()
*/
function loadData() {
  // pyramid chart input files
  var inputPyramidDataFile = "data/data - pyramid.csv";
  var inputPyramidChartFieldsFile = "data/inputFieldnames - pyramid.csv";

  // store all input files as a Promise
  Promise.all([
    d3.csv(inputPyramidDataFile),
    d3.csv(inputPyramidChartFieldsFile),
  ]).then(function (data) {
    // locally store data

    pyramidData = data[0];
    aleph.inputPyramidFieldnames_src = data[1];

    aleph.inputFieldnames = { pyramid: {} };

    aleph.inputPyramidFieldnames_src.forEach(function (d) {
      aleph.inputFieldnames.pyramid[d["codeFieldName"]] =
        d["dataFileFieldName"];
      aleph.PyramidNonYearFields.push(d["dataFileFieldName"]);
    }); // end forEach

    // stores all data ahas JSON element in global JSON object
    aleph.data = {
      pyramid: pyramidData,
    };

    drawPyramidsChart();
  });

  return;
} // end function loadData();
