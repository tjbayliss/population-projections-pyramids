/*
  Project: Future Forces Population Projections interactive dashboard
  Filename: aleph-futureForces-pyramidChart-script.js
  Date built: December 2020 to April 2021
  Written By: James Bayliss (Data Vis Developer)
  Tech Stack: HTML5, CSS3, JS ES5/6, D3 (v5), JQuery 

  USEFUL LINKS: https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/articles/ukpopulationpyramidinteractive/2020-01-08

  Chosen selection lists:
  
  https://stackoverflow.com/questions/9160988/chosen-select-an-option-by-default-with-jquery
  https://stackoverflow.com/questions/21191111/how-to-clear-the-select-boxes/21636570#21636570
  https://stackoverflow.com/questions/33456909/remove-option-dynamically-from-jquery-chosen
  https://stackoverflow.com/questions/22050905/chosen-select-append-and-remove-items-from-a-multiple-select
  https://github.com/harvesthq/chosen/issues/343
*/
console.log("aleph-futureForces-pyramidChart-script.js");

var actionedToggleBtn;
var totalYearPopulation = -1;

// locally store total male and female pops.
var totalMaleYearPopulation = -1;
var totalFemaleYearPopulation = -1;

/*











  NAME: initialisePyramidSelectionCriteriaObjects 
  DESCRIPTION: function to  
  ARGUMENTS TAKEN:
  ARGUMENTS RETURNED:
  CALLED FROM: changeChart()
  CALLS: 
*/
function initialisePyramidSelectionCriteriaObjects() {
  aleph.pyramidCurrentScenarios["left"] = {
    ethnicities: [1, 2, 3, 4, 5, 6],
    regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  };

  aleph.pyramidCurrentScenarios["right"] = {
    ethnicities: [1, 2, 3, 4, 5, 6],
    regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  };

  return;
} // end function initialisePyramidSelectionCriteriaObjects
/*











  NAME: drawPyramidsChart 
  DESCRIPTION: function to restart rebuild of vis page content
  ARGUMENTS TAKEN:
  ARGUMENTS RETURNED:
  CALLED FROM: changeChart()
  CALLS:  buildPyramids()
*/
function drawPyramidsChart() {
  aleph.years = d3.keys(aleph.data.pyramid[0]).filter(function (d, i) {
    return aleph.PyramidNonYearFields.indexOf(d) == -1;
  });

  aleph.nested_pure_year_all_data = [];

  aleph.years.forEach(function (d, i) {
    // locally store year value ...
    var year = d;

    // rollup nest data to count demographic per year
    nested_all_data = d3
      .nest()
      .key(function () {
        return +year;
      })
      .key(function (d) {
        return d.Age;
      })
      .rollup(function (leaves) {
        return {
          d: d3.sum(leaves, function (d) {
            return +d[year];
          }),
        };
      })
      .entries(aleph.data.pyramid);

    // ALL DATA
    aleph.nested_pure_year_all_data.push({
      year: nested_all_data[0].key,
      yearTotalPopulation: sumYear(nested_all_data[0].values),
    });
  });

  console.log(aleph.nested_pure_year_all_data);

  d3.selectAll(".pyramid-slider")
    .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
    .append("label")
    .attr("class", "aleph-slider-year-label selected-year aleph-hide")
    .text("");

  /* d3.select("#pyramid-slider") */
  d3.selectAll(".pyramid-slider")
    .append("span")
    .attr(
      "class",
      "aleph-slider-year-label-locked-year-marker-span aleph-hide"
    );

  d3.selectAll(".aleph-slider-year-label-locked-year-marker-span")
    .append("div")
    .attr("class", "aleph-slider-year-label-locked-year-marker");

  d3.selectAll(".pyramid-slider")
    .append("label")
    .attr("class", "aleph-slider-year-label locked-year aleph-hide")
    .text("");

  // loop through each pyramid
  aleph.pyramids.forEach(function (d) {
    // call function to build both new pyramids
    buildPyramids(d, "onload");
  }); // end forEach

  return;
} // end function drawPyramidsChart()

/*





  NAME: getPyramidData 
  DESCRIPTION: function called to manipulate ingested data to structures allowing pyramid building
  ARGUMENTS TAKEN: side - which pyramid is being built (left or right)
  ARGUMENTS RETURNED: none
  CALLED FROM: buildPyramids
  CALLS: none 
*/
function getPyramidData(side) {
  // initialise locally and globally used arrays and objects
  // for ALL data
  var nested_all_data;
  var nested_all_data_array = [];
  aleph.nested_all_data_object = {};

  // for MALE data
  var nested_male_data;
  var nested_male_data_array = [];
  aleph.nested_male_data_object = {};

  // for FEMALE data
  var nested_female_data;
  var nested_female_data_array = [];
  aleph.nested_female_data_object = {};

  // for all data ... filter on gender and ethnicity (more filter variables to be added later with additon of more selection lists...)
  var allData = aleph.data.pyramid.filter(function (d) {
    // if statement relates to initial (all data load and display of pyramids coming from another page, or user selection of "All Ethnicities" on selection list)
    if (
      aleph.pyramidCurrentScenarios[side].ethnicities.indexOf(
        +d[aleph.inputFieldnames.pyramid.ethnicity]
      ) != -1 &&
      aleph.pyramidCurrentScenarios[side].regions.indexOf(
        +d[aleph.inputFieldnames.pyramid.region]
      ) != -1
    ) {
      return (
        +d[aleph.inputFieldnames.pyramid.sex] == 1 ||
        +d[aleph.inputFieldnames.pyramid.sex] == 2
      );
    }
  }); // end filter loop

  // console.log(allData);

  var maleData = aleph.data.pyramid.filter(function (d) {
    // if statement relates to initial (all data load and display of pyramids coming from another page, or user selection of "All Ethnicities" on selection list)
    if (
      aleph.pyramidCurrentScenarios[side].ethnicities.indexOf(
        +d[aleph.inputFieldnames.pyramid.ethnicity]
      ) != -1 &&
      aleph.pyramidCurrentScenarios[side].regions.indexOf(
        +d[aleph.inputFieldnames.pyramid.region]
      ) != -1
    ) {
      return +d[aleph.inputFieldnames.pyramid.sex] == 1;
    }
  }); // end filter loop

  // console.log(maleData);

  var femaleData = aleph.data.pyramid.filter(function (d) {
    // if statement relates to initial (all data load and display of pyramids coming from another page, or user selection of "All Ethnicities" on selection list)
    if (
      aleph.pyramidCurrentScenarios[side].ethnicities.indexOf(
        +d[aleph.inputFieldnames.pyramid.ethnicity]
      ) != -1 &&
      aleph.pyramidCurrentScenarios[side].regions.indexOf(
        +d[aleph.inputFieldnames.pyramid.region]
      ) != -1
    ) {
      return +d[aleph.inputFieldnames.pyramid.sex] == 2;
    }
  }); // end filter loop

  // console.log(femaleData);

  // for each plotted year on chart ...
  aleph.years.forEach(function (d, i) {
    // locally store year value ...
    var year = d;

    // rollup nest data to count demographic per year
    nested_all_data = d3
      .nest()
      .key(function () {
        return +year;
      })
      .key(function (d) {
        return d.Age;
      })
      .rollup(function (leaves) {
        return {
          d: d3.sum(leaves, function (d) {
            return +d[year];
          }),
        };
      })
      .entries(allData);

    // rollup nest data to count demographic per year
    nested_male_data = d3
      .nest()
      .key(function () {
        return +year;
      })
      .key(function (d) {
        return d.Age;
      })
      .rollup(function (leaves) {
        return {
          d: d3.sum(leaves, function (d) {
            return +d[year];
          }),
        };
      })
      .entries(maleData);

    // rollup nest data to count demographic per year
    nested_female_data = d3
      .nest()
      .key(function (d) {
        return +year;
      })
      .key(function (d) {
        return d.Age;
      })
      .rollup(function (leaves) {
        return {
          d: d3.sum(leaves, function (d) {
            return +d[year];
          }),
        };
      })
      .entries(femaleData);

    //
    //
    //
    // ALL DATA
    nested_all_data_array.push({
      year: nested_all_data[0].key,
      values: nested_all_data[0].values.map(function (d, i) {
        return { key: d.key, value: d.value.d };
      }),
      yearGenderTotalPopulation: sumYear(nested_all_data[0].values),
      yearTotalPopulation: sumYear(nested_all_data[0].values),
    });

    nested_all_data_array.forEach(function (d) {
      var element = {
        values: d.values,
        yearGenderTotalPopulation: d.yearGenderTotalPopulation,
        yearTotalPopulation: d.yearTotalPopulation,
      };
      aleph.nested_all_data_object[d.year] = element;
    });

    //
    //
    //
    // MALE DATA
    nested_male_data_array.push({
      year: nested_male_data[0].key,
      values: nested_male_data[0].values.map(function (d, i) {
        return { key: d.key, value: d.value.d };
      }),
      yearGenderTotalPopulation: sumYear(nested_male_data[0].values),
      yearTotalPopulation: sumYear(nested_all_data[0].values),
    });

    nested_male_data_array.forEach(function (d, i) {
      var element = {
        values: d.values,
        yearGenderTotalPopulation: d.yearGenderTotalPopulation,
        yearTotalPopulation: d.yearTotalPopulation,
      };
      aleph.nested_male_data_object[d.year] = element;
    });

    //
    //
    //
    // FEMALE DATA
    nested_female_data_array.push({
      year: nested_female_data[0].key,
      values: nested_female_data[0].values.map(function (d, i) {
        return { key: d.key, value: d.value.d };
      }),
      yearGenderTotalPopulation: sumYear(nested_female_data[0].values),
      yearTotalPopulation: sumYear(nested_all_data[0].values),
    });

    nested_female_data_array.forEach(function (d, i) {
      var element = {
        values: d.values,
        yearGenderTotalPopulation: d.yearGenderTotalPopulation,
        yearTotalPopulation: d.yearTotalPopulation,
      };
      aleph.nested_female_data_object[d.year] = element;
    });
  }); // end forEach

  return;
} // end function getPyramidData

/*





  NAME: buildPyramids 
  DESCRIPTION: function called to build both pyramids with extracted and manipulated data
  ARGUMENTS TAKEN: chartSide - defines whther left or right hand chart is being considered
  ARGUMENTS RETURNED: none
  CALLED FROM: drawPyramidsChart()
              any selector lists
  CALLS:  getPyramidData()
          setSliderTicks()
*/
function buildPyramids(chartSide, src) {
  var percentageTotal = 0.0;
  var percentageTotalMale = 0.0;
  var percentageTotalFemale = 0.0;

  // remove data basrs on the specific pyramid being considered
  d3.selectAll(".bar.leftBars." + chartSide).remove();
  d3.selectAll(".bar.rightBars." + chartSide).remove();
  d3.selectAll(".bar.maskingBars." + chartSide).remove();
  d3.selectAll(".aleph-xAxisTicks." + chartSide + ".Left").remove();
  d3.selectAll(".aleph-xAxisTicks." + chartSide + ".Right").remove();

  // build new JSON object storage for side being considered
  if (chartSide == "left") {
    aleph.pyramidFullData_v2.left = [];
  } // end if ...
  else if (chartSide == "right") {
    aleph.pyramidFullData_v2.right = [];
  } // end else if ...
  else {
  } // end else ...

  // call function to extract and manipulate raw data into suitable data structures for pyramid building
  getPyramidData(chartSide);

  // select correct 'g' elements to build pyramid on, and remove it (old pyramid) ...
  d3.selectAll(
    ".aleph-pyramid-group.aleph-pyramid-group-" + chartSide
  ).remove();

  // update dimension values of container div
  svgWidth = $(".aleph-chart.aleph-pyramid-chart").width();
  svgHeight = $(".aleph-chart.aleph-pyramid-chart").height();

  aleph.pyramidVerticalOffset = svgHeight;

  // select base SVG panel for building pyramids on ...
  // append a new group element, having jsut removed it (with old chart contents)
  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .append("g")
    .attr("class", "aleph-pyramid-group aleph-pyramid-group-" + chartSide)
    .attr("transform", function () {
      if (chartSide == "left") {
        lateralPosition =
          d3
            .selectAll(".aleph-pyramid-chart")
            .style("width")
            .replace("px", "") * aleph.pyramidLateralPosition.left;

        // d3.selectAll(".aleph-chart-container.aleph-pyramid-chart-container")
        //   .append("label")
        //   .attr("class", "aleph-currentSelection-Lists " + chartSide)
        //   .style("position", "absolute")
        //   .style("left", "0%")
        //   .style("top", "0px")
        //   .html(function () {
        //     var string = "";

        //     for (var list in aleph.pyramidCurrentScenarios[chartSide]) {
        //       var listToProcess =
        //         aleph.pyramidCurrentScenarios[chartSide][list];
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

        return (
          "translate(" +
          lateralPosition +
          "," +
          (aleph.pyramidVerticalOffset - aleph.pyramidMargin.bottom) +
          ")"
        );
      } else {
        lateralPosition =
          d3
            .selectAll(".aleph-pyramid-chart")
            .style("width")
            .replace("px", "") * aleph.pyramidLateralPosition.right;

        // d3.selectAll(".aleph-chart-container.aleph-pyramid-chart-container")
        //   .append("label")
        //   .attr("class", "aleph-currentSelection-Lists " + chartSide)
        //   .style("position", "absolute")
        //   .style("right", "0%")
        //   .style("top", "0px")
        //   .html(function () {
        //     var string = "";

        //     for (var list in aleph.pyramidCurrentScenarios[chartSide]) {
        //       var listToProcess =
        //         aleph.pyramidCurrentScenarios[chartSide][list];
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

        return (
          "translate(" +
          lateralPosition +
          "," +
          (aleph.pyramidVerticalOffset - aleph.pyramidMargin.bottom) +
          ")"
        );
      }
    });

  // locally store total population value for currently selected year.
  var yearTotalPopulation =
    aleph.nested_all_data_object[aleph.pyramidYear].yearTotalPopulation;

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("text")
    .attr("class", "aleph-fixed-summary-stats-top")
    .attr("x", 0)
    .attr("y", -svgHeight + 190)
    .text(numberWithCommas(yearTotalPopulation) + " people selected");

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("text")
    .attr("class", "aleph-fixed-summary-stats-bottom")
    .attr("x", 0)
    .attr("y", -svgHeight + 210)
    .text(
      "from total UK population of " +
      numberWithCommas(
        aleph.nested_pure_year_all_data[aleph.pyramidYearIndex]
          .yearTotalPopulation
      ) +
      " in " +
      aleph.pyramidYear
    );

  // LEFT PYRAMID ...
  // define domain and range for x-axis for mapping data rectangles against ...
  aleph.left_Pyramid_xAxis_Left = d3
    .scaleLinear()
    .range([
      -aleph.pyramidXAxisWidth +
      aleph.pyramidMargin.left +
      aleph.pyramidMargin.right,
      0,
    ])
    .domain([0, 1]);

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr("class", "aleph-pyramidChart-axis-group-" + chartSide)
    .attr(
      "transform",
      "translate(" + 0 + "," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  // append g element to hold pyramid x-axis
  d3.selectAll(".aleph-pyramidChart-axis-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "axis axis--x pyramid-xAxis " + chartSide + "_Pyramid_xAxis_Left"
    )
    .style("display", "none")
    .attr(
      "transform",
      "translate(" +
      -aleph.pyramidOffset +
      "," +
      aleph.pyramidOffsetVerticalOffset +
      ")"
    )
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left));

  // x-axis for mapping tick labels against in correct direction ...
  aleph.left_Pyramid_xAxis_Left_FALSE = d3
    .scaleLinear()
    .range([
      -aleph.pyramidXAxisWidth +
      aleph.pyramidMargin.left +
      aleph.pyramidMargin.right,
      0,
    ])
    .domain([1, 0]);

  // append g element to hold pyramid x-axis
  d3.selectAll(".aleph-pyramidChart-axis-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "axis axis--x pyramid-xAxis " + chartSide + "_Pyramid_xAxis_Left_FALSE"
    )
    .attr("transform", "translate(" + -aleph.pyramidOffset + "," + 0 + ")")
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left_FALSE));

  // define y-axis domain and range for left-hand half of pyramid
  aleph.left_Pyramid_yAxis_Left = d3
    .scaleBand()
    .rangeRound([
      0,
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom,
    ])
    .padding(0.0)
    .domain(aleph.SYOAs);

  // append g element to hold pyramid x-axis
  d3.selectAll(".aleph-pyramidChart-axis-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "axis axis--y pyramid-yAxis " + chartSide + "_Pyramid_yAxis_Left"
    )
    .attr("transform", "translate(" + -aleph.pyramidOffset + "," + 0 + ")")
    .call(d3.axisRight(aleph.left_Pyramid_yAxis_Left));

  // define x-axis domain and range for right-hand half of pyramid
  aleph.left_Pyramid_xAxis_Right = d3
    .scaleLinear()
    .range([
      0,
      aleph.pyramidXAxisWidth -
      aleph.pyramidMargin.left -
      aleph.pyramidMargin.right,
    ])
    .domain([0, 1]);

  // append 'g'g element to hold right hand half of pyramid
  d3.selectAll(".aleph-pyramidChart-axis-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "axis axis--x pyramid-xAxis " + chartSide + "_Pyramid_xAxis_Right"
    )
    .attr("transform", "translate(" + aleph.pyramidOffset + "," + 0 + ")")
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Right));

  aleph.left_Pyramid_xAxis_Left_FALSE(
    aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
  ) - aleph.pyramidOffset;

  d3.selectAll(
    ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left_FALSE"
  )
    .append("text")
    .attr("class", "chartLabel Males")
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left_FALSE(
        aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
      ) + 0
    )
    .attr("y", -1)
    .text("Males");

  d3.selectAll(
    ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Right"
  )
    .append("text")
    .attr("class", "chartLabel Females")
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) - 0
    )
    .attr("y", -1)
    .text("Females");

  // define domain and range of y-axis for righthand side of pyramid chart
  aleph.left_Pyramid_yAxis_Right = d3
    .scaleBand()
    .rangeRound([
      0,
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom,
    ])
    .padding(0.0)
    .domain(aleph.SYOAs);

  // append group element to hold y-axis to right hand half of pyuramid chart.
  d3.selectAll(".aleph-pyramidChart-axis-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "axis axis--y pyramid-yAxis " + chartSide + "_Pyramid_yAxis_Right"
    )
    .attr("transform", "translate(" + aleph.pyramidOffset + "," + 0 + ")")
    .call(d3.axisLeft(aleph.left_Pyramid_yAxis_Right));

  // call function to map manipulated data objects to individual SYOAs
  mapYearsAgainstAges(chartSide);

  /*




  */

  // if user has made a change to any selection list, there is a need to determine if x-axis maximum has changed from current adopted/rounded value
  // and modify the active chart accordingly (i.e. the chart for which the selection change WAS made) and then subsequently the passive chart
  if (
    (src == "selector" && aleph.pyramidOnload == false) ||
    /* aleph.pyramidOnload == true &&  */ src == "onload"
  ) {
    // console.log("before axis maximum call:", src);
    // call function to determine x axis maximum for new set ups
    determine_xAxisMaximums();

    // update lefthand x axis for active/modifed pyramid
    aleph.left_Pyramid_xAxis_Left.domain([
      0,
      Math.ceil(
        aleph.xAxisMaximums.values.percent /
        aleph.xAxisMaximums.roundings.percent
      ) * aleph.xAxisMaximums.roundings.percent,
    ]);

    // call update change to active pyramid lefthand x axis.
    d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      .selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left"
      )
      .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left));

    // update FALSE lefthand x axis for active/modified pyramid
    aleph.left_Pyramid_xAxis_Left_FALSE.domain([
      Math.ceil(
        aleph.xAxisMaximums.values.percent /
        aleph.xAxisMaximums.roundings.percent
      ) * aleph.xAxisMaximums.roundings.percent,
      0,
    ]);

    // call update change to active FALSE lefthand x axis.
    d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      .selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left_FALSE"
      )
      .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left_FALSE));

    // update righthand x axis for active/modiifed pyramid
    aleph.left_Pyramid_xAxis_Right.domain([
      0,
      Math.ceil(
        aleph.xAxisMaximums.values.percent /
        aleph.xAxisMaximums.roundings.percent
      ) * aleph.xAxisMaximums.roundings.percent,
    ]);

    // call update change to active right hand x axis.
    d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      .selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Right"
      )
      .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Right));

    // call function to update other/passive pyramid.
    changeOpposingPyramid(chartSide);
  } // end if ...

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var xticks = d3
    .selectAll(".axis.axis--x." + chartSide + "_Pyramid_xAxis_Left_FALSE")
    .selectAll(".tick");
  xticks
    .append("svg:line")
    .attr("class", "aleph-xAxisTicks " + chartSide + " Left")
    .attr("y0", 0)
    .attr(
      "y1",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
    )
    .attr("x1", 0)
    .attr("x2", 0);

  // select tick grid lines extending from x-axis ticks on axis up graph
  var xticks = d3
    .selectAll(".axis.axis--x." + chartSide + "_Pyramid_xAxis_Right")
    .selectAll(".tick");

  // append tick grid lines extending from x-axis ticks on axis up graph
  xticks
    .append("svg:line")
    .attr("class", "aleph-xAxisTicks " + chartSide + " Right")
    .attr("y0", 0)
    .attr(
      "y1",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
    )
    .attr("x1", 0)
    .attr("x2", 0);

  /*




*/

  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr("class", "aleph-maleBar-group aleph-maleBar-group-" + chartSide)
    .attr(
      "transform",
      "translate(0," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  // attach MALE specific data to DOM rect objects
  d3.selectAll(".aleph-maleBar-group-" + chartSide)
    .selectAll(".bar.leftBars." + chartSide)
    .data(aleph.pyramidFullData_v2[chartSide])
    .enter()
    .append("rect")
    .attr("class", function (d, i) {
      return "bar leftBars " + chartSide + " b" + i;
    })
    .attr("id", function (d, i) {
      return "leftBar-" + chartSide + "-" + i;
    })
    .attr("x", function (d) {
      var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];
      percentageTotalMale = percentageTotalMale + value;
      return (
        aleph.left_Pyramid_xAxis_Left(
          aleph.left_Pyramid_xAxis_Left.domain()[0]
        ) +
        (1 - aleph.left_Pyramid_xAxis_Left(value)) -
        aleph.pyramidOffset
      );
    })
    .attr("width", function (d) {
      var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

      var rectWidth =
        aleph.left_Pyramid_xAxis_Left(
          aleph.left_Pyramid_xAxis_Left.domain()[0]
        ) - aleph.left_Pyramid_xAxis_Left(value);

      return Math.abs(rectWidth);
    })
    .attr("y", function (d, i) {
      var age = aleph.SYOAs[i];
      return aleph.left_Pyramid_yAxis_Left(age);
    })
    .attr("height", aleph.left_Pyramid_yAxis_Left.bandwidth());

  // console.log("Percentage after Plotting MALE data bars:", percentageTotalMale);

  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr("class", "aleph-femaleBar-group aleph-femaleBar-group-" + chartSide)
    .attr(
      "transform",
      "translate(0," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  // attach FEMALE specific data to DOM rect objects
  d3.selectAll(".aleph-femaleBar-group-" + chartSide)
    .selectAll(".bar.rightBars." + chartSide)
    .data(aleph.pyramidFullData_v2[chartSide])
    .enter()
    .append("rect")
    .attr("class", function (d, i) {
      return "bar rightBars " + chartSide + " b" + i;
    })
    .attr("id", function (d, i) {
      return "rightBar-" + chartSide + "-" + i;
    })
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[0]
      ) + aleph.pyramidOffset
    )
    .attr("width", function (d, i) {
      var value = d.female[aleph.pyramidYearIndex][aleph.countsPercents];
      percentageTotalFemale = percentageTotalFemale + value;
      return aleph.left_Pyramid_xAxis_Right(value);
    })
    .attr("y", function (d, i) {
      var age = aleph.SYOAs[i];
      return aleph.left_Pyramid_yAxis_Right(age);
    })
    .attr("height", aleph.left_Pyramid_yAxis_Right.bandwidth());

  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr("class", "aleph-maskingBar-group aleph-maskingBar-group-" + chartSide)
    .attr(
      "transform",
      "translate(0," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  d3.selectAll(".aleph-maskingBar-group-" + chartSide)
    .append("text")
    .attr("class", "aleph-SYOA-marker aleph-SYOA-marker-" + chartSide);

  d3.selectAll(".aleph-maskingBar-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-ageBand-Detail aleph-ageBand-Marker aleph-ageBand-startMarker aleph-ageBand-startMarker-" +
      chartSide
    );

  d3.selectAll(".aleph-maskingBar-group-" + chartSide)
    .append("line")
    .attr(
      "class",
      "aleph-ageBand-Detail aleph-ageBand-Range-Line aleph-ageBand-Range-Line-" +
      chartSide
    )
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("y1", 0)
    .attr("y2", 0);

  d3.selectAll(".aleph-maskingBar-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-ageBand-Detail aleph-ageBand-Marker aleph-ageBand-endMarker aleph-ageBand-endMarker-" +
      chartSide
    );

  // append grey-scale masking interaction data bars ...
  // attach ALL data to DOM rect objects
  d3.selectAll(".aleph-maskingBar-group-" + chartSide)
    .selectAll(".bar.maskingBars." + chartSide)
    .data(aleph.pyramidFullData_v2[chartSide])
    .enter()
    .append("rect")
    .attr("class", "bar maskingBars " + chartSide)
    .attr("id", function (d, i) {
      return "maskingBar-" + chartSide + "-" + i;
    })
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left(aleph.left_Pyramid_xAxis_Left.domain()[0]) -
      aleph.pyramidOffset
    )
    .attr("y", function (d, i) {
      var age = aleph.SYOAs[i];
      return aleph.left_Pyramid_yAxis_Left(age);
    })
    .attr("width", function () {
      var maskingBarWidth =
        /*  aleph.barChartScaleFactor *  */ aleph.pyramidOffset * 2 +
        (aleph.left_Pyramid_xAxis_Right(
          aleph.left_Pyramid_xAxis_Right.domain()[1]
        ) -
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ));
      return maskingBarWidth;
    })
    .attr("height", aleph.left_Pyramid_yAxis_Left.bandwidth())
    .on("mousedown", function (d, i) {
      // console.log("mousedown");

      /* START NEW CODE */
      $("#resetPyramids").prop("disabled", false).removeClass("aleph-disabled");
      /* END NEW CODE */

      aleph.mouseState = "down";

      aleph.startAgeBandIndex = i;
      aleph.startAgeBand = aleph.SYOAs[i];

      if (aleph.pyramidDataBarClicked == false) {
        // detemine ageband and SYOA being interrogated
        var ageBand = aleph.SYOAs[i];
        var SYOAIndex = i;

        // for both pyramids, each in turn ... for selected SYOA information panel
        aleph.pyramids.forEach(function (d, i) {
          // locally store the side being considered
          var side = d;

          d3.selectAll(".selectedAgeBandDetail-ageBand").text(
            "Age: " + ageBand
          );

          // update text of number of males info
          d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + side)
            .selectAll(".selectedAgeBandDetail-Count-male." + side)
            .text(
              numberWithCommas(
                aleph.pyramidFullData_v2[side][SYOAIndex].male[
                  aleph.pyramidYearIndex
                ].count
              ) /*  + " males" */
            );

          // update text of male percentage info
          d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + side)
            .selectAll(".selectedAgeBandDetail-Percent-male." + side)
            .text(
              aleph.pyramidFullData_v2[side][SYOAIndex].male[
                aleph.pyramidYearIndex
              ].percent.toFixed(2) + "%"
            );

          // update text of number of females info
          d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + side)
            .selectAll(".selectedAgeBandDetail-Count-female." + side)
            .text(
              numberWithCommas(
                aleph.pyramidFullData_v2[side][SYOAIndex].female[
                  aleph.pyramidYearIndex
                ].count
              ) /*  + " females" */
            );

          // update text of females percentage info
          d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + side)
            .selectAll(".selectedAgeBandDetail-Percent-female." + side)
            .text(
              aleph.pyramidFullData_v2[side][SYOAIndex].female[
                aleph.pyramidYearIndex
              ].percent.toFixed(2) + "%"
            );
        }); // end forEach

        // update var denoting a SYOA rectangle has been and is currently clicked.
        aleph.pyramidDataBarClicked = true;

        // display value added information rectangles.
        d3.selectAll(".selectedAgeBandDetail").classed("aleph-hide", false);
      } // end if .. .
      else if (aleph.pyramidDataBarClicked == true) {
        // hide value added information rectangles.
        d3.selectAll(".selectedAgeBandDetail").classed("aleph-hide", true);

        // update var denoting a SYOA rectangle has been and is NOT currently clicked.
        aleph.pyramidDataBarClicked = false;

        // modify styling of left and right bars to revert to default colour.
        d3.selectAll(".bar.leftBars")
          .classed("clicked", false)
          .classed("hovered", false);
        d3.selectAll(".bar.rightBars")
          .classed("clicked", false)
          .classed("hovered", false);

        d3.selectAll(".aleph-ageBand-Detail").classed("aleph-hide", true);
      } // end

      return;
    })
    .on("mousemove", function (d, i) {
      // console.log("mousemove");
      // bring both value add info box to front of screen to not masked by data bars
      d3.selectAll(".aleph-selectedAgeBandDetail-group").moveToFront();

      if (aleph.mouseState == "down") {
        d3.selectAll(".aleph-ageBand-Marker").text("");

        aleph.endAgeBandIndex = i;
        aleph.endAgeBand = aleph.SYOAs[i];

        if (aleph.startAgeBandIndex == aleph.endAgeBandIndex) {
          d3.selectAll(".selectedAgeBandDetail-ageBand").text(
            "Age: " + aleph.startAgeBand
          );
          d3.selectAll(".aleph-SYOA-marker")
            .attr(
              "y",
              aleph.left_Pyramid_yAxis_Left(aleph.SYOAs[i]) +
              aleph.left_Pyramid_yAxis_Left.bandwidth()
            )
            .text(aleph.SYOAs[i]);
        } // end if ...
        else {
          aleph.mouseDragState = true;

          d3.selectAll(".aleph-SYOA-marker").text("");

          d3.selectAll(".aleph-ageBand-Detail").classed("aleph-hide", false);
          d3.selectAll(".aleph-ageBand-startMarker")
            .attr(
              "x",
              aleph.left_Pyramid_xAxis_Right(
                aleph.left_Pyramid_xAxis_Right.domain()[0]
              ) + aleph.middle
            )
            .attr("dy", "0.25rem")
            .attr(
              "y",
              aleph.left_Pyramid_yAxis_Left(aleph.startAgeBand) +
              aleph.left_Pyramid_yAxis_Left.bandwidth()
            )
            .text(aleph.startAgeBand);

          d3.selectAll(".aleph-ageBand-endMarker")
            .attr(
              "x",
              aleph.left_Pyramid_xAxis_Right(
                aleph.left_Pyramid_xAxis_Right.domain()[0]
              ) + aleph.middle
            )
            .attr("dy", "0.25rem")
            .attr(
              "y",
              aleph.left_Pyramid_yAxis_Left(aleph.endAgeBand) +
              aleph.left_Pyramid_yAxis_Left.bandwidth()
            )
            .text(aleph.endAgeBand);

          d3.selectAll(".selectedAgeBandDetail-ageBand").text(
            "Age range: " +
            d3.min([aleph.startAgeBand, aleph.endAgeBand]) +
            " to " +
            d3.max([aleph.startAgeBand, aleph.endAgeBand])
          );

          d3.selectAll(".aleph-ageBand-Range-Line")
            .attr(
              "x1",
              aleph.left_Pyramid_xAxis_Right(
                aleph.left_Pyramid_xAxis_Right.domain()[0]
              ) + aleph.middle
            )
            .attr(
              "x2",
              aleph.left_Pyramid_xAxis_Right(
                aleph.left_Pyramid_xAxis_Right.domain()[0]
              ) + aleph.middle
            )
            .attr(
              "y1",
              aleph.left_Pyramid_yAxis_Left(
                d3.max([aleph.startAgeBand, aleph.endAgeBand])
              ) +
              aleph.left_Pyramid_yAxis_Left.bandwidth() +
              10
            )
            .attr(
              "y2",
              aleph.left_Pyramid_yAxis_Left(
                d3.min([aleph.startAgeBand, aleph.endAgeBand])
              ) +
              aleph.left_Pyramid_yAxis_Left.bandwidth() -
              15
            );
        } // end else ...
      } // end if ...

      return;
    })
    .on("mouseup", function (d, i) {
      aleph.mouseState = "up";
      // console.log("mouseup", aleph.mouseState);

      aleph.endAgeBandIndex = i;
      aleph.endAgeBand = aleph.SYOAs[i];

      if (aleph.mouseDragState == true) {
        d3.selectAll(".aleph-ageBand-endMarker")
          .attr(
            "x",
            aleph.left_Pyramid_xAxis_Right(
              aleph.left_Pyramid_xAxis_Right.domain()[0]
            ) + aleph.middle
          )
          .attr("dy", "0.25rem")
          .attr(
            "y",
            aleph.left_Pyramid_yAxis_Left(aleph.endAgeBand) +
            aleph.left_Pyramid_yAxis_Left.bandwidth()
          )
          .text(aleph.endAgeBand);
      }

      if (aleph.mouseDragState == true) {
        d3.selectAll(".bar.leftBars").classed("aleph-semi-transparent", true);
        d3.selectAll(".bar.rightBars").classed("aleph-semi-transparent", true);
        d3.selectAll(".bar.leftBars").classed("hovered", false);
        d3.selectAll(".bar.rightBars").classed("hovered", false);
      } else {
        d3.selectAll(".bar.leftBars").classed("aleph-semi-transparent", false);
        d3.selectAll(".bar.rightBars").classed("aleph-semi-transparent", false);
      }

      aleph.pyramids.forEach(function (d, i) {
        var chartSide = d;

        aleph.ageRange_MaleCount = 0;
        aleph.ageRange_FemaleCount = 0;

        aleph.ageRange_MalePercent = 0.0;
        aleph.ageRange_FemalePercent = 0.0;

        aleph.SYOAs.forEach(function (d, i) {
          if (
            i >= d3.min([aleph.startAgeBandIndex, aleph.endAgeBandIndex]) &&
            i <= d3.max([aleph.startAgeBandIndex, aleph.endAgeBandIndex])
          ) {
            d3.selectAll(".bar.leftBars.b" + i).classed(
              "aleph-semi-transparent",
              false
            );
            d3.selectAll(".bar.rightBars.b" + i).classed(
              "aleph-semi-transparent",
              false
            );

            aleph.ageRange_MaleCount =
              aleph.ageRange_MaleCount +
              aleph.pyramidFullData_v2[chartSide][i].male[
                aleph.pyramidYearIndex
              ].count;

            aleph.ageRange_FemaleCount =
              aleph.ageRange_FemaleCount +
              aleph.pyramidFullData_v2[chartSide][i].female[
                aleph.pyramidYearIndex
              ].count;

            d3.selectAll(".selectedAgeBandDetail-Count-male." + chartSide).text(
              numberWithCommas(aleph.ageRange_MaleCount) /* + " males" */
            );

            d3.selectAll(
              ".selectedAgeBandDetail-Count-female." + chartSide
            ).text(
              numberWithCommas(aleph.ageRange_FemaleCount) /*  + " females" */
            );

            aleph.ageRange_MalePercent =
              aleph.ageRange_MalePercent +
              aleph.pyramidFullData_v2[chartSide][i].male[
                aleph.pyramidYearIndex
              ].percent;

            aleph.ageRange_FemalePercent =
              aleph.ageRange_FemalePercent +
              aleph.pyramidFullData_v2[chartSide][i].female[
                aleph.pyramidYearIndex
              ].percent;

            // update text of male percentage info
            d3.selectAll(
              ".aleph-pyramid-group.aleph-pyramid-group-" + chartSide
            )
              .selectAll(".selectedAgeBandDetail-Percent-male." + chartSide)
              .text(aleph.ageRange_MalePercent.toFixed(2) + "%");

            // update text of male percentage info
            d3.selectAll(
              ".aleph-pyramid-group.aleph-pyramid-group-" + chartSide
            )
              .selectAll(".selectedAgeBandDetail-Percent-female." + chartSide)
              .text(aleph.ageRange_FemalePercent.toFixed(2) + "%");
          }
        });
      });

      aleph.mouseDragState = false;

      // bring both value add info box to front of screen to not masked by data bars
      d3.selectAll(".aleph-selectedAgeBandDetail-group").moveToFront();

      return;
    })
    .on("mouseover", function (d, i) {
      var males = d.male;
      var females = d.female;
      var index = i;

      d3.selectAll(".bar.maskingBars").style("fill-opacity", 0);
      d3.select("#maskingBar-left-" + i).style("fill-opacity", 0.5);
      d3.select("#maskingBar-right-" + i).style("fill-opacity", 0.5);

      var left = Number(
        d3
          .selectAll(".aleph-pyramid-group.aleph-pyramid-group-left")
          .attr("transform")
          .replace("translate(", "")
          .substr(
            0,
            d3
              .selectAll(".aleph-pyramid-group.aleph-pyramid-group-left")
              .attr("transform")
              .replace("translate(", "")
              .indexOf(",")
          )
      );

      var right = Number(
        d3
          .selectAll(".aleph-pyramid-group.aleph-pyramid-group-right")
          .attr("transform")
          .replace("translate(", "")
          .substr(
            0,
            d3
              .selectAll(".aleph-pyramid-group.aleph-pyramid-group-right")
              .attr("transform")
              .replace("translate(", "")
              .indexOf(",")
          )
      );

      aleph.middle = (right - left) / 2;

      d3.selectAll(".aleph-SYOA-marker")
        .attr(
          "x",
          aleph.left_Pyramid_xAxis_Right(
            aleph.left_Pyramid_xAxis_Right.domain()[0]
          ) + aleph.middle
        )
        .attr("dy", "0.25rem")
        .attr(
          "y",
          aleph.left_Pyramid_yAxis_Left(aleph.SYOAs[i]) +
          aleph.left_Pyramid_yAxis_Left.bandwidth()
        )
        .text(aleph.SYOAs[i]);

      // if user has not clicked a masking data bar
      if (aleph.pyramidDataBarClicked == false) {
        // modify style of left and right hand data bars
        d3.select("#leftBar-left-" + i).classed("hovered", true);
        d3.select("#leftBar-right-" + i).classed("hovered", true);

        d3.select("#rightBar-left-" + i).classed("hovered", true);
        d3.select("#rightBar-right-" + i).classed("hovered", true);
      }

      // determine age and SYOA being considered
      var ageBand = aleph.SYOAs[i];

      // /* var */ totalYearPopulation =
      //   yearTotalPopulation /*  d3.sum(nested_all_data[0].values) */;
      // locally store total male and female pops.
      /* var */ totalMaleYearPopulation =
        males[aleph.pyramidYearIndex]["count"];
      /* var */ totalFemaleYearPopulation =
        females[aleph.pyramidYearIndex]["count"];

      aleph.pyramids.forEach(function (d, i) {
        var revisedTotalYearPopulation = 0;
        var revisedMaleYearPopulation = 0;
        var revisedFemaleYearPopulation = 0;
        var cs = d;

        for (var SYOA in aleph.pyramidFullData_v2[cs]) {
          var all_arr = aleph.pyramidFullData_v2[cs][SYOA].all;

          revisedTotalYearPopulation =
            revisedTotalYearPopulation + all_arr[aleph.pyramidYearIndex];

          revisedMaleYearPopulation =
            aleph.pyramidFullData_v2[cs][index]["male"][aleph.pyramidYearIndex]
              .count;

          revisedFemaleYearPopulation =
            aleph.pyramidFullData_v2[cs][index]["female"][
              aleph.pyramidYearIndex
            ].count;
        } // end for ...

        // calculate male perc. of ageband
        var maleYearPercentageOfAgeBand = (
          (revisedMaleYearPopulation /
            (revisedFemaleYearPopulation + revisedMaleYearPopulation)) *
          100
        ).toFixed(1);

        // calculate female perc. of ageband
        var femaleYearPercentageOfAgeBand = (
          (revisedFemaleYearPopulation /
            (revisedFemaleYearPopulation + revisedMaleYearPopulation)) *
          100
        ).toFixed(1);

        // update age band text label
        d3.selectAll(".aleph-pyramid-dynamic-subtitle").text("Age " + ageBand);

        // update total number of males in age band text label
        d3.selectAll(".aleph-pyramid-dynamic-subtitle-male-" + cs).text(
          numberWithCommas(revisedMaleYearPopulation) /*  + " males" */
        );

        // update total number of females in age band text label
        d3.selectAll(".aleph-pyramid-dynamic-subtitle-female-" + cs).text(
          numberWithCommas(revisedFemaleYearPopulation) /*  + " females" */
        );

        // append 'age' label to top-middle of pyramid chart ...
        d3.selectAll(".aleph-pyramid-dynamic-subtitle-value-" + cs).html(
          numberWithCommas(
            /* revisedTotalYearPopulation */ revisedMaleYearPopulation +
            revisedFemaleYearPopulation
          ) /*  +
            " people in " +
            aleph.pyramidYear */
        );

        // only display thumbnail male data bar if width is valid number
        if (!isNaN(maleYearPercentageOfAgeBand)) {
          d3.selectAll(".aleph-pyramid-dynamic-subtitle-male-percentage-" + cs)
            .style("text-anchor", "end")
            .text(maleYearPercentageOfAgeBand + "%");

          d3.selectAll(".thumbnail.barChart.rect.male").attr(
            "width",
            aleph.barChartScaleFactor * maleYearPercentageOfAgeBand
          );
        } else {
          d3.selectAll(".aleph-pyramid-dynamic-subtitle-male-percentage-" + cs)
            .style("text-anchor", "start")
            .text("No persons in age band");
          d3.selectAll(".thumbnail.barChart.rect.male").attr("width", 0);
        }

        // only display thumbnail female data bar if width is valid number
        if (!isNaN(femaleYearPercentageOfAgeBand)) {
          d3.selectAll(
            ".aleph-pyramid-dynamic-subtitle-female-percentage-" + cs
          )
            .style("text-anchor", "end")
            .text(femaleYearPercentageOfAgeBand + "%");

          d3.selectAll(".thumbnail.barChart.rect.female").attr(
            "width",
            aleph.barChartScaleFactor * femaleYearPercentageOfAgeBand
          );
        } else {
          d3.selectAll(
            ".aleph-pyramid-dynamic-subtitle-female-percentage-" + cs
          )
            .style("text-anchor", "start")
            .text("No persons in age band");
          d3.selectAll(".thumbnail.barChart.rect.female").attr("width", 0);
        }
      });

      return;
    })
    .on("mouseout", function () {
      d3.selectAll(".bar.maskingBars").style("fill-opacity", 0);
      d3.selectAll(".aleph-SYOA-marker").text("");

      aleph.pyramids.forEach(function (d, i) {
        var malePop = 0;
        var femalePop = 0;
        var cs2 = d;

        aleph.pyramidFullData_v2[cs2].forEach(function (d, i) {
          malePop = malePop + d["male"][aleph.pyramidYearIndex].count;
          femalePop = femalePop + d["female"][aleph.pyramidYearIndex].count;
        });

        revisedMaleYearPopulation = malePop;
        revisedFemaleYearPopulation = femalePop;

        d3.selectAll(".aleph-pyramid-dynamic-subtitle-value-" + cs2).html(
          numberWithCommas(
            revisedMaleYearPopulation + revisedFemaleYearPopulation
          ) /*  +
            " people in " +
            aleph.pyramidYear */
        );

        d3.selectAll(".aleph-pyramid-dynamic-subtitle").text("All ages");
        // update total number of males in age band text label
        d3.selectAll(".aleph-pyramid-dynamic-subtitle-male-" + cs2).text(
          numberWithCommas(revisedMaleYearPopulation) /*  + " males" */
        );

        d3.selectAll(
          ".aleph-pyramid-dynamic-subtitle-male-percentage-" + cs2
        ).text(
          (
            (aleph.nested_male_data_object[aleph.pyramidYear]
              .yearGenderTotalPopulation /
              aleph.nested_all_data_object[aleph.pyramidYear]
                .yearTotalPopulation) *
            100
          ).toFixed(1) + "%"
        );

        // append male rectangle for thumbnail chart at top of pyramid
        d3.selectAll(".thumbnail.barChart.rect.male").attr(
          "width",
          aleph.barChartScaleFactor *
          (
            (aleph.nested_male_data_object[aleph.pyramidYear]
              .yearGenderTotalPopulation /
              aleph.nested_all_data_object[aleph.pyramidYear]
                .yearTotalPopulation) *
            100
          ).toFixed(1)
        );

        // update total number of females in age band text label
        d3.selectAll(".aleph-pyramid-dynamic-subtitle-female-" + cs2).text(
          numberWithCommas(revisedFemaleYearPopulation) /*  + " females" */
        );

        d3.selectAll(
          ".aleph-pyramid-dynamic-subtitle-female-percentage-" + cs2
        ).text(
          (
            (aleph.nested_female_data_object[aleph.pyramidYear]
              .yearGenderTotalPopulation /
              aleph.nested_all_data_object[aleph.pyramidYear]
                .yearTotalPopulation) *
            100
          ).toFixed(1) + "%"
        );

        // append male rectangle for thumbnail chart at top of pyramid
        d3.selectAll(".thumbnail.barChart.rect.female").attr(
          "width",
          aleph.barChartScaleFactor *
          (
            (aleph.nested_female_data_object[aleph.pyramidYear]
              .yearGenderTotalPopulation /
              aleph.nested_all_data_object[aleph.pyramidYear]
                .yearTotalPopulation) *
            100
          ).toFixed(1)
        );
      });

      // if user has not clicked a masking data bar
      if (aleph.pyramidDataBarClicked == false) {
        d3.selectAll(".bar.leftBars").classed("hovered", false);
        d3.selectAll(".bar.rightBars").classed("hovered", false);
      } else {
      }
      return;
    });

  // reposition and align tick labels on visible y-axis (centred between charts)
  d3.selectAll(
    ".axis.axis--y.pyramid-yAxis." + chartSide + "_Pyramid_yAxis_Left"
  )
    .selectAll(".tick")
    .selectAll("text")
    .attr("x", aleph.pyramidOffset)
    .style("text-anchor", "middle");

  // remove duplicate y-axis labels (bewteen charts)
  d3.selectAll("." + chartSide + "_Pyramid_yAxis_Right")
    .selectAll(".tick")
    .selectAll("text")
    .style("display", "none");

  // bring both y-axes to front, so not being masked by start of data rectangles.
  d3.selectAll(".axis.axis--y.pyramid-yAxis").moveToFront();

  var tickCounter = -1;
  // modify display of set patttern of ticks on both x-axes
  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left_FALSE"
    )
    .selectAll(".tick")
    .style("display", function (d, i) {
      tickCounter++;
      if (tickCounter % 2 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  var tickCounter = -1;

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Right"
    )
    .selectAll(".tick")
    .style("display", function (d, i) {
      tickCounter++;
      if (tickCounter % 2 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  // modify display of set patttern of ticks on both y-axes
  d3.selectAll(
    ".axis.axis--y.pyramid-yAxis." + chartSide + "_Pyramid_yAxis_Left"
  )
    .selectAll(".tick")
    .style("display", function (i) {
      if (i % 10 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  // modify display of set patttern of ticks on both y-axes
  d3.selectAll(
    ".axis.axis--y.pyramid-yAxis." + chartSide + "_Pyramid_yAxis_Right"
  )
    .selectAll(".tick")
    .style("display", function (i) {
      if (i % 10 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr("class", "aleph-high-Level-Information-group-" + chartSide);

  // append main pyramid x-axis title below pyramid chart
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr("class", "aleph-pyramid-title")
    .attr("x", 0)
    .attr("y", 60)
    .html(aleph.axisMainTitles.pyramidChart.x);

  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr("class", "aleph-pyramid-subTitleAnnex")
    .attr("x", 0)
    .attr("y", 80)
    .html(
      "(" +
      (
        (aleph.nested_all_data_object[aleph.pyramidYear].yearTotalPopulation /
          aleph.nested_pure_year_all_data[aleph.pyramidYearIndex]
            .yearTotalPopulation) *
        100
      ).toFixed(2) +
      "% of total UK population)"
    );
  // .html(
  //   "(" +
  //     numberWithCommas(
  //       (yearTotalPopulation /
  //         aleph.nested_pure_year_all_data[aleph.pyramidYearIndex]
  //           .yearTotalPopulation) *
  //         100
  //     ) +
  //     "% of total UK population)"
  // );

  // numberWithCommas(yearTotalPopulation) + " people in " + aleph.pyramidYear

  // append number of males text string label
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle-male aleph-pyramid-dynamic-subtitle-male-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) + aleph.pyramidOffset
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      45 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text(
      numberWithCommas(
        aleph.nested_male_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation
      ) /*  + " males" */
    );

  addPyramidHalfSelectedAgeBandDetail(chartSide);

  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle-male-percentage aleph-pyramid-dynamic-subtitle-male-percentage-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left(aleph.left_Pyramid_xAxis_Left.domain()[1]) -
      5
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      45 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text(
      (
        (aleph.nested_male_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation /
          aleph.nested_all_data_object[aleph.pyramidYear].yearTotalPopulation) *
        100
      ).toFixed(1) + "%"
    );

  // append 'age' label to top-middle of pyramid chart ...
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle aleph-pyramid-dynamic-subtitle-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left(aleph.left_Pyramid_xAxis_Left.domain()[0]) -
      aleph.pyramidOffset
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      45 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text("All ages");

  // append 'total number of people in currnet pyramid year' label to top of pyramid chart ...
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle-value aleph-pyramid-dynamic-subtitle-value-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left(aleph.left_Pyramid_xAxis_Left.domain()[0]) -
      aleph.pyramidOffset
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      12.5 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text(
      /* numberWithCommas(yearTotalPopulation) + " people in " + aleph.pyramidYear */
      numberWithCommas(yearTotalPopulation) + " people"
    );

  // append text for percetnage value of males in SYOAS for slected year
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle-female aleph-pyramid-dynamic-subtitle-female-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) + aleph.pyramidOffset
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      12.5 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text(
      numberWithCommas(
        aleph.nested_female_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation
      ) /*  + " females " */
    );

  // append text for percetnage value of females in SYOAS for slected year
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "aleph-pyramid-dynamic-subtitle-female-percentage aleph-pyramid-dynamic-subtitle-female-percentage-" +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left(aleph.left_Pyramid_xAxis_Left.domain()[1]) -
      5
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      12.5 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text(
      (
        (aleph.nested_female_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation /
          aleph.nested_all_data_object[aleph.pyramidYear].yearTotalPopulation) *
        100
      ).toFixed(1) + "%"
    );

  // append male rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("rect")
    .attr("class", "thumbnail barChart rect male")
    .attr(
      "width",
      aleph.barChartScaleFactor *
      (
        (aleph.nested_male_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation /
          aleph.nested_all_data_object[aleph.pyramidYear]
            .yearTotalPopulation) *
        100
      ).toFixed(1)
    )
    .attr("height", 29)
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      65.5 +
      aleph.pyramidOffsetVerticalOffset
    );

  // append male rectangle for thumbnail chart at top of pyramid

  // append male rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("rect")
    .attr("class", "thumbnail barChart rectAxis male")
    .attr("width", aleph.barChartScaleFactor * 100)
    .attr("height", 1)
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      65.5 +
      aleph.pyramidOffsetVerticalOffset +
      28
    );

  // append male rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr("class", "thumbnail barChart rectLabel male")
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      43 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text("Males");

  // append female rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("rect")
    .attr("class", "thumbnail barChart rect female")
    .attr(
      "width",
      aleph.barChartScaleFactor *
      (
        (aleph.nested_female_data_object[aleph.pyramidYear]
          .yearGenderTotalPopulation /
          aleph.nested_all_data_object[aleph.pyramidYear]
            .yearTotalPopulation) *
        100
      ).toFixed(1)
    )
    .attr("height", 29)
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      35 +
      aleph.pyramidOffsetVerticalOffset
    );

  // append male rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("rect")
    .attr("class", "thumbnail barChart rectAxis female")
    .attr("width", aleph.barChartScaleFactor * 100)
    .attr("height", 2)
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      35 +
      aleph.pyramidOffsetVerticalOffset +
      27
    );

  // append female rectangle for thumbnail chart at top of pyramid
  d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
    .append("text")
    .attr("class", "thumbnail barChart rectLabel female")
    .attr("x", 5)
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom -
      13 +
      aleph.pyramidOffsetVerticalOffset
    )
    .text("Females");

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "aleph-pyramid-outline-paths-group aleph-pyramid-outline-paths-group-" +
      chartSide
    )
    .attr(
      "transform",
      "translate(0," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  // print solid path outlines to each pyramid halves..
  for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
    chartSide
  ]) {
    aleph.pyramidGenderLineCurrentlyProcessing = gender;

    // localiss intialisation of json object for storing line data
    var pyramidHalfOutlineData = {};

    // if suer has locked pyrmaid outlines.
    if (aleph.freezeOutlines == "lock") {
      pyramidHalfOutlineData =
        aleph.pyramidFullOutlineData[aleph.lockedYear][chartSide][gender];
    }
    // otherwise if user has not locked pyramid outlines ...
    else {
      pyramidHalfOutlineData =
        aleph.pyramidFullOutlineData[aleph.pyramidYear][chartSide][gender];
    }

    // call function to draw line pth for outline of pyramid
    d3.selectAll(".aleph-pyramid-outline-paths-group-" + chartSide)
      .append("path")
      .attr("class", chartSide + " aleph-pyramid-outline " + gender)
      .attr("d", pyramidOutlinePath(pyramidHalfOutlineData));
  } // end for loop ...

  // call function to append ticks to slider bar.
  setSliderTicks("#pyramid-slider");

  return;
} // end function buildPyramids
/*




7
  NAME: pyramidOutlinePath 
  DESCRIPTION: function to draw solid thick outline paths around pop.pyramids. 
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: line path defintion
  CALLED FROM:  buildPyramids()
                transitionPyramidChart()
                freezeOutlines()
                countsPercents()
                updatePyramids()
  CALLS: none
*/
var pyramidOutlinePath = d3
  .line()
  .x(function (d) {
    // draw MALE line on LHS side of pyramids
    if (aleph.pyramidGenderLineCurrentlyProcessing == "male") {
      return (
        aleph.left_Pyramid_xAxis_Left(
          aleph.left_Pyramid_xAxis_Left.domain()[0]
        ) +
        (1 - aleph.left_Pyramid_xAxis_Left(d.x[aleph.countsPercents])) -
        aleph.pyramidOffset
      );
    }

    // draw FEMALE line on RHS side of pyramids
    else if (aleph.pyramidGenderLineCurrentlyProcessing == "female") {
      return (
        aleph.left_Pyramid_xAxis_Right(d.x[aleph.countsPercents]) +
        aleph.pyramidOffset
      );
    }
  })
  .y(function (d) {
    return d.y[aleph.countsPercents];
  });

/*





  NAME: pyramid-slider 
  DESCRIPTION: fucntion to construct time interval slider to change pyramid
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: user interaction with slider (index.html)
  CALLS: transitionPyramidChart()
         updateInformationLabels()
*/
$(function () {
  $("#pyramid-slider").slider({
    value: 2019,
    min: 2019,
    max: 2040,
    step: 1,
    slide: function (event, ui) {
      $("#resetPyramids").prop("disabled", false).removeClass("aleph-disabled");

      aleph.pyramidYear = ui.value;

      d3.select("#pyramid-slider")
        .selectAll(".selected-year")
        .classed("aleph-hide", false)
        .text(aleph.pyramidYear);

      /* START NEW CODE */
      d3.selectAll(".aleph-main-yearLabel").text(aleph.pyramidYear);

      /* END NEW CODE */

      aleph.pyramidYearIndex = aleph.years.indexOf(
        aleph.pyramidYear.toString()
      );

      transitionPyramidChart();
      updateInformationLabels();
    },
  });
});

/*





  NAME: sumYear 
  DESCRIPTION: function called o sum all year data for ALL, MALE and FEMALE data
  ARGUMENTS TAKEN: data - 
  ARGUMENTS RETURNED: total - summed data value
  CALLED FROM: getPyramidData()
  CALLS: none   
*/
function sumYear(data) {
  var total = 0;

  // loop through passed data and sum it ...
  data.forEach(function (d, i) {
    var count = d.value.d;
    total = total + count;
  });

  return total;

  return;
} // end function sumYear

/*





  NAME: setSliderTicks 
  DESCRIPTION:
  ARGUMENTS TAKEN: el - DOM reference name to slider to append ticks to.
  ARGUMENTS RETURNED: none
  CALLED FROM: buildPyramids()
  CALLS: none    
// https://www.sitepoint.com/community/t/custom-range-slider-with-ticks/319324
*/
function setSliderTicks(el) {
  // initialise reelvant slider variables in function.
  var $slider = $(el);

  var max = $slider.slider("option", "max");
  var min = $slider.slider("option", "min");
  var range = max - min;
  var step = $slider.slider("option", "step");
  var spacing = 100 / ((max - min) / step);

  // remove previuous ticks and labels before redrawing
  $slider.find(".ui-slider-tick-mark").remove();
  $slider.find(".ui-slider-tick-label").remove();

  // loop through number of ticks calculated to add
  for (var i = 0; i <= (max - min) / step; i++) {
    // append tick span DOM item
    $('<span class="ui-slider-tick-mark"></span>')
      .css("left", spacing * i - 0.0 + "%")
      .appendTo($slider);

    // append tick label span DOM item
    $('<span class="ui-slider-tick-label"></span>')
      .text(aleph.years[i])
      .css("top", function () {
        return "-5px";
      })
      .css("left", function () {
        if (i == 0) {
          return spacing * i - 7.5 + "%";
        } else if (i == range) {
          return spacing * i + 1.5 + "%";
        } else {
          return "none";
        }
      })
      .css("display", function () {
        if (i == 0 || i == range) {
          return "inline";
        } else {
          return "none";
        }
      })
      .appendTo($slider);
  }

  d3.selectAll(".ui-slider-svg").moveToFront();

  return;
} // end function setSliderTicks
/*





  NAME: transitionPyramidChart 
  DESCRIPTION: fucntion called update pyramid chart view when user selcted new dtaa year of different pop. demogrpahic characteristics. 
  ARGUMENTS TAKEN:
  ARGUMENTS RETURNED:
  CALLED FROM:
  CALLS:    
*/
function transitionPyramidChart() {
  // transition left/Male data bars of Left hand pyramid
  aleph.pyramids.forEach(function (d, i) {
    var chartSide = d;

    // select all data bars on left hand side of charts ...
    /// modify bar widths, and starting points (though no need to )
    d3.selectAll(".bar.leftBars." + chartSide)
      .transition()
      .delay(function (d, i) {
        return i * aleph.pyramidDelay;
      })
      .duration(aleph.pyramidTransitionLength)
      .ease(d3.easeLinear)
      .attr("x", function (d) {
        var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

        return (
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ) +
          (1 - aleph.left_Pyramid_xAxis_Left(value)) -
          aleph.pyramidOffset
        );
      })
      .attr("width", function (d) {
        var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

        var rectWidth =
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ) - aleph.left_Pyramid_xAxis_Left(value);

        return Math.abs(rectWidth);
      });

    // select all data bars on right hnad side of charts ...
    /// modify bar widths, and starting points (though no need to )
    d3.selectAll(".bar.rightBars." + chartSide)
      .transition()
      .delay(function (d, i) {
        return i * aleph.pyramidDelay;
      })
      .duration(aleph.pyramidTransitionLength)
      .ease(d3.easeLinear)
      .attr(
        "x",
        aleph.left_Pyramid_xAxis_Right(
          aleph.left_Pyramid_xAxis_Right.domain()[0]
        ) + aleph.pyramidOffset
      )
      .attr("width", function (d) {
        var value = d.female[aleph.pyramidYearIndex][aleph.countsPercents];
        return aleph.left_Pyramid_xAxis_Right(value);
      });

    // modify and update outline SVG line paths drawn
    // determine if user has locked lines via UI button, if so, dont redraw.
    if (aleph.freezeOutlines == "unlock") {
      // print solid path outlines to each pyramid halves..
      for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
        chartSide
      ]) {
        aleph.pyramidGenderLineCurrentlyProcessing = gender;

        // modify and update outline SVG line paths drawn
        //  if user has locked lines via UI button, dont redraw.
        if (aleph.freezeOutlines == "lock") {
          pyramidHalfOutlineData =
            aleph.pyramidFullOutlineData[aleph.lockedYear][chartSide][gender];
        }
        // otherwise redraw ..
        else {
          pyramidHalfOutlineData =
            aleph.pyramidFullOutlineData[aleph.pyramidYear][chartSide][gender];
        }

        d3.selectAll("." + chartSide + ".aleph-pyramid-outline." + gender).attr(
          "d",
          pyramidOutlinePath(pyramidHalfOutlineData)
        );
      } // end for loop ...
    } // end if ....
  }); // end forEach

  return;
} // end function transitionPyramidChart

/*





  NAME: myStopFunction 
  DESCRIPTION: fucntion called to stop auto looping through data time series. 
  ARGUMENTS TAKEN:
  ARGUMENTS RETURNED:
  CALLED FROM:
  CALLS: clearInterval()
*/
function myStopFunction() {
  clearInterval(aleph.myPopPyramidSetInterval);
  return;
} // end function myStopFunction

/*





  NAME: updateInformationLabels 
  DESCRIPTION: fucntion call to update 
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM:  pyramid-slider()
                pyramid_playStop()
  CALLS: numberWithCommas()
*/
function updateInformationLabels() {
  // for each pyramid ...
  aleph.pyramids.forEach(function (d, i) {
    var chartSide = d;
    var index = i;

    var revisedTotalYearPopulation = 0;
    var revisedMaleYearPopulation = 0;
    var revisedFemaleYearPopulation = 0;

    var malePop = 0;
    var femalePop = 0;

    aleph.pyramidFullData_v2[chartSide].forEach(function (d, i) {
      malePop = malePop + d["male"][aleph.pyramidYearIndex].count;
      femalePop = femalePop + d["female"][aleph.pyramidYearIndex].count;
    });

    revisedMaleYearPopulation = malePop;
    revisedFemaleYearPopulation = femalePop;
    revisedTotalYearPopulation = malePop + femalePop;

    d3.selectAll(".aleph-high-Level-Information-group-" + chartSide)
      .selectAll(".aleph-pyramid-subTitleAnnex")
      .html(
        "(" +
        (
          (revisedTotalYearPopulation /
            aleph.nested_pure_year_all_data[aleph.pyramidYearIndex]
              .yearTotalPopulation) *
          100
        ).toFixed(2) +
        "% of total UK population)"
      );

    d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      .selectAll(".aleph-fixed-summary-stats-top")
      .text(numberWithCommas(revisedTotalYearPopulation) + " people selected");

    d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      .selectAll(".aleph-fixed-summary-stats-bottom")
      .text(
        "from total UK population of " +
        numberWithCommas(
          aleph.nested_pure_year_all_data[aleph.pyramidYearIndex]
            .yearTotalPopulation
        ) +
        " in " +
        aleph.pyramidYear
      );

    // calculate locally the years total ALL population
    // var yearTotalPopulation =
    //   aleph.nested_all_data_object[aleph.pyramidYear].yearTotalPopulation;

    // // calculate locally the years total MALE population
    // var yearMalePopulation =
    //   aleph.nested_male_data_object[aleph.pyramidYear]
    //     .yearGenderTotalPopulation;

    // // calculate locally the years total FEMALE population
    // var yearFemalePopulation =
    //   aleph.nested_female_data_object[aleph.pyramidYear]
    //     .yearGenderTotalPopulation;

    // calculate locally the years total MALE percetnage population of age band
    // var maleYearPercentageOfAgeBand = (
    //   /* yearMalePopulation */ (revisedMaleYearPopulation /
    //     /* yearTotalPopulation */ revisedTotalYearPopulation) *
    //   100
    // ).toFixed(1);

    // calculate male perc. of ageband
    var maleYearPercentageOfAgeBand = /* totalMaleYearPopulation */ (
      (revisedMaleYearPopulation /
        /* totalFemaleYearPopulation */ (revisedFemaleYearPopulation +
          /* totalMaleYearPopulation */ revisedMaleYearPopulation)) *
      100
    ).toFixed(1);

    // calculate locally the years total FEMALE percetnage population of age band
    // var femaleYearPercentageOfAgeBand = /* yearFemalePopulation */ (
    //   (revisedFemaleYearPopulation /
    //     /* yearTotalPopulation */ revisedTotalYearPopulation) *
    //   100
    // ).toFixed(1);

    // calculate male perc. of ageband
    var femaleYearPercentageOfAgeBand = /* totalMaleYearPopulation */ (
      (revisedFemaleYearPopulation /
        /* totalFemaleYearPopulation */ (revisedFemaleYearPopulation +
          /* totalMaleYearPopulation */ revisedMaleYearPopulation)) *
      100
    ).toFixed(1);

    // console.log(aleph.pyramidYear,chartSide,revisedTotalYearPopulation,revisedMaleYearPopulation,revisedFemaleYearPopulation,maleYearPercentageOfAgeBand,femaleYearPercentageOfAgeBand)

    // update "people in YEAR" label
    d3.selectAll(".aleph-pyramid-dynamic-subtitle-value-" + chartSide).text(
      numberWithCommas(revisedTotalYearPopulation) /*  + " people " */
      /*   " people in " +
        aleph.pyramidYear */
    );

    // update "MALE people in YEAR" label
    d3.selectAll(".aleph-pyramid-dynamic-subtitle-male-" + chartSide).text(
      numberWithCommas(revisedMaleYearPopulation) /*  + " males" */
    );

    // update "FEMALE people in YEAR" label
    d3.selectAll(".aleph-pyramid-dynamic-subtitle-female-" + chartSide).text(
      numberWithCommas(revisedFemaleYearPopulation) /*  + " females" */
    );

    // update "MALE %age in YEAR" label
    d3.selectAll(
      ".aleph-pyramid-dynamic-subtitle-male-percentage-" + chartSide
    ).text(maleYearPercentageOfAgeBand + "%");

    // update "FEMALE %age in YEAR" label
    d3.selectAll(
      ".aleph-pyramid-dynamic-subtitle-female-percentage-" + chartSide
    ).text(femaleYearPercentageOfAgeBand + "%");

    // update width of "MALE %age" data bar
    d3.selectAll(".thumbnail.barChart.rect.male").attr(
      "width",
      aleph.barChartScaleFactor * maleYearPercentageOfAgeBand
    );

    // update width of "FEMALE %age" data bar
    d3.selectAll(".thumbnail.barChart.rect.female").attr(
      "width",
      aleph.barChartScaleFactor * femaleYearPercentageOfAgeBand
    );
  }); // end forEach

  return;
} // end function updateInformationLabels

/*





  NAME: addPyramidSelectionLists 
  DESCRIPTION: function called to append the requred chosen selection lists to the UI at page load.
  ARGUMENTS TAKEN: chartSide - defintion of which sides pyramid is being considered
  ARGUMENTS RETURNED: none
  CALLED FROM: drawPyramidsChart()
  CALLS: buildPyramids()
*/
function addPyramidSelectionLists(chartSide) {
  for (var list in aleph.pyramidCurrentScenarios[chartSide]) {
    var id =
      aleph.selectionListConfigurations.pyramid[list].id + "-" + chartSide;
    var value = aleph.selectionListConfigurations.pyramid[list].value;
    var multiple = aleph.selectionListConfigurations.pyramid[list].multiple;
    var title = aleph.selectionListConfigurations.pyramid[list].title;
    var dataStyle =
      aleph.selectionListConfigurations.pyramid[list]["data-style"];
    var dataActionsBox =
      aleph.selectionListConfigurations.pyramid[list]["data-actions-box"];
    var dataWidth =
      aleph.selectionListConfigurations.pyramid[list]["data-width"];
    var dataDropupAuto =
      aleph.selectionListConfigurations.pyramid[list]["data-dropup-auto"];
    var defaults = aleph.selectionListConfigurations.pyramid[list]["defaults"];
    var dataHeader =
      aleph.selectionListConfigurations.pyramid[list]["data-header"];
    var container =
      aleph.selectionListConfigurations.pyramid[list]["container"] +
      "-" +
      chartSide;

    var selectedTextFormat =
      aleph.selectionListConfigurations.pyramid[list][
      "data-selected-text-format"
      ];

    var valueIndexArray = [];
    var labelValues = [];

    for (var i = 1; i < aleph.selectionLists[list].length + 1; i++) {
      valueIndexArray.push(i);
      labelValues.push(
        aleph.selectionLists[list][i - 1]
          .replace(" to ", "-")
          .replace(" and over", "+")
      );
    }

    // build and manipulate data arrays to help populate array...
    var options = d3.zip(
      aleph.selectionLists[list],
      valueIndexArray,
      aleph.codes[list],
      labelValues
    );

    // sort list element array
    aleph.options = options.sort(function (b, a) {
      return d3.descending(a[1], b[1]);
    });

    d3.selectAll("." + container)
      .append("select")
      .attr("class", "selectpicker form-control")
      .attr("id", id)
      .attr("value", value)
      .attr("multiple", multiple)
      .attr("title", title)
      .attr("data-style", dataStyle)
      .attr("data-actions-box", dataActionsBox)
      .attr("data-width", dataWidth)
      .attr("data-dropup-auto", dataDropupAuto)
      .attr("data-header", dataHeader)
      .attr("data-selected-text-format", selectedTextFormat);

    d3.select("#" + id)
      .selectAll(".selectOptions." + list)
      .data(aleph.options)
      .enter()
      .append("option")
      .attr("class", "selectOptions " + list)
      .attr("value", function (d) {
        return d[1];
      })
      .text(function (d) {
        return d[2];
      });

    $("#" + id).selectpicker({
      style: "btn-primary",
    });

    $("#" + id).on(
      "changed.bs.select",
      function (e, clickedIndex, isSelected, previousValue) {
        d3.selectAll(".aleph-currentSelection-Lists").remove();

        var list = this.id
          .replace("pyramid-selectpicker-", "")
          .replace("-left", "")
          .replace("-right", "");
        var side = chartSide;

        actionedToggleBtn = $("[data-id=" + this.id + "]");

        // console.log(
        //   this,
        //   this.id,
        //   clickedIndex,
        //   list,
        //   chartSide,
        //   "[",
        //   actionedToggleBtn,
        //   "]",
        //   isSelected
        // );

        if (clickedIndex == null && aleph.pyramidOnload == false) {
          actionPyramidSelectDeselectAll(list, chartSide, actionedToggleBtn);
        } else if (clickedIndex != null) {
          /* START NEW CODE */
          $("#resetPyramids")
            .prop("disabled", false)
            .removeClass("aleph-disabled");
          /* END NEW CODE */

          var parameterIndex = Number(clickedIndex) + 1;

          if (isSelected) {
            aleph.pyramidCurrentScenarios[side][list].push(parameterIndex);

            $(actionedToggleBtn)
              .removeClass("btn-danger")
              .addClass("btn-primary");
          } else {
            const index =
              aleph.pyramidCurrentScenarios[side][list].indexOf(parameterIndex);
            if (index > -1) {
              aleph.pyramidCurrentScenarios[side][list].splice(index, 1);

              if (aleph.pyramidCurrentScenarios[side][list].length == 0) {
                $(actionedToggleBtn)
                  .removeClass("btn-primary")
                  .addClass("btn-danger");
              } else {
                $(actionedToggleBtn)
                  .removeClass("btn-danger")
                  .addClass("btn-primary");
              }
            }
          }

          var selectionStr = "";
          var sortedSelectionList = aleph.pyramidCurrentScenarios[side][
            list
          ].sort(function (a, b) {
            return a - b;
          });

          if (sortedSelectionList.length == aleph.selectionLists[list].length) {
            d3.selectAll("." + list + "-selections-" + side).text(
              "All " + list
            );
          } else {
            aleph.pyramidCurrentScenarios[side][list].forEach(function (d, i) {
              var selection = d;
              selectionStr =
                selectionStr + aleph.codes[list][selection - 1] + ", ";
            });

            selectionStr = selectionStr.substring(0, selectionStr.length - 2);
            d3.selectAll("." + list + "-selections-" + side).text(selectionStr);
          }
        }
        if (
          (aleph.pyramidCurrentScenarios[side].ethnicities.length == 0 ||
            aleph.pyramidCurrentScenarios[side].regions.length == 0) &&
          aleph.pyramidOnload == false
        ) {
          d3.selectAll(
            ".alert.alert-danger.alert-dismissible.pyramidChart.incompleteSelections"
          ).classed("aleph-hide", false);

          d3.selectAll(".aleph-alert-pyramid-incompleteSelections").html(
            "Please complete the " +
            side +
            "-hand '" +
            list +
            "' selection list"
          );
          return;
        } else {
          d3.selectAll(
            ".alert.alert-danger.alert-dismissible.pyramidChart.incompleteSelections"
          ).classed("aleph-hide", true);

          if (aleph.pyramidOnload == false) {
            buildPyramids(chartSide, "selector");
          } // end if ...
        } // end else ...
      }
    ); // end .on...
  } // end for loop ...

  $(".bs-select-all").on("click", function () {
    aleph.selectAll = true;
  });
  $(".bs-deselect-all").on("click", function () {
    aleph.selectAll = false;
  });

  return;
} // end function addPyramidSelectionLists

/*





  NAME: addPyramidHalfSelectedAgeBandDetail 
  DESCRIPTION: function called to append value added content to each pyramides halves to display info on selected SYOA
  ARGUMENTS TAKEN: chartSide- which pyrmaid is being considered.
  ARGUMENTS RETURNED: none
  CALLED FROM: buildPyramids
  CALLS:
*/
function addPyramidHalfSelectedAgeBandDetail(chartSide) {
  // males side ...
  // append background rectangle

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
    .append("g")
    .attr(
      "class",
      "aleph-selectedAgeBandDetail-group aleph-selectedAgeBandDetail-group-" +
      chartSide
    )
    .attr(
      "transform",
      "translate(0," + aleph.pyramidOffsetVerticalOffset + ")"
    );

  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("rect")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-background selectedAgeBandDetail-male aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left_FALSE(
        aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
      ) - aleph.pyramidOffset
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom +
      25 -
      25
    )
    .attr("width", /* 125 */ 160)
    .attr("height", 90);

  // append "Selected AgeBand" text  to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-ageBand selectedAgeBandDetail-ageBand-male aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left_FALSE(
        aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
      ) -
      aleph.pyramidOffset +
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 25
    )
    .text("Selected AgeBand");

  // append "Selected Age Count" text to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-Count-male aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left_FALSE(
        aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
      ) -
      aleph.pyramidOffset +
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 50
    )
    .text("Selected Age Count");

  // append "Selected Age Percent" text to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-Percent-male aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Left_FALSE(
        aleph.left_Pyramid_xAxis_Left_FALSE.domain()[0]
      ) -
      aleph.pyramidOffset +
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 75
    )
    .text("Selected Age Percent");

  // FEMALE SIDES ...
  // background rectangle
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("rect")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-background selectedAgeBandDetail-female aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) +
      aleph.pyramidOffset -
      160
    )
    .attr(
      "y",
      -svgHeight +
      aleph.pyramidMargin.top +
      aleph.pyramidMargin.bottom +
      25 -
      25
    )
    .attr("width", /* 125 */ 160)
    .attr("height", 90);

  // append "Selected Age" text to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-ageBand selectedAgeBandDetail-ageBand-female aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) +
      aleph.pyramidOffset -
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 25
    )
    .text("Selected Age");

  // append "Selected Age Count" text to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-Count-female aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) +
      aleph.pyramidOffset -
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 50
    )
    .text("Selected Age Count");

  // append "Selected Age Percent" text to pyramid half side.
  d3.selectAll(".aleph-selectedAgeBandDetail-group-" + chartSide)
    .append("text")
    .attr(
      "class",
      "selectedAgeBandDetail selectedAgeBandDetail-Percent-female aleph-hide " +
      chartSide
    )
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[1]
      ) +
      aleph.pyramidOffset -
      10
    )
    .attr(
      "y",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom + 75
    )
    .text("Selected Age Percent");

  return;
} // end fucnction addPyramidHalfSelectedAgeBandDetail(chartSide)

/*





  NAME: mapYearsAgainstAges 
  DESCRIPTION: function called to genreate JSON object containing each SYOA data information
  ARGUMENTS TAKEN: side - chart side being considered
  ARGUMENTS RETURNED: none
  CALLED FROM: buildPyramids()
  CALLS: none
*/
function mapYearsAgainstAges(side) {
  var SYOAs = [];
  SYOAs = aleph.nested_all_data_object["2019"].values;

  SYOAs.forEach(function () {
    aleph.pyramidFullData_v2[side].push({
      all: [],
      male: [],
      female: [],
    });
  }); // end forEach

  for (var year in aleph.nested_all_data_object) {
    var yearTotalPopulation =
      aleph.nested_all_data_object[year].yearTotalPopulation;

    if (!aleph.pyramidFullOutlineData.hasOwnProperty(year)) {
      aleph.pyramidFullOutlineData[year] = {};
    }
    aleph.pyramidFullOutlineData[year][side] = { male: [], female: [] };

    var SYOA_AllValues = aleph.nested_all_data_object[year].values;
    var SYOA_MaleValues = aleph.nested_male_data_object[year].values;
    var SYOA_FemaleValues = aleph.nested_female_data_object[year].values;

    SYOA_AllValues.forEach(function (d, i) {
      aleph.pyramidFullData_v2[side][i].all.push(d.value);
    });

    /*


    MALES


    */

    SYOA_MaleValues.forEach(function (d, i) {
      var ageBand = d.key;

      // Construct arrays for pyramid outlines
      var valueAsPercentageAgeBand = (d.value / yearTotalPopulation) * 100;

      aleph.pyramidFullOutlineData[year][side].male.push({
        x: {
          count: d.value,
          percent: valueAsPercentageAgeBand,
        },
        y: {
          count:
            aleph.left_Pyramid_yAxis_Left(ageBand) +
            aleph.left_Pyramid_yAxis_Left.bandwidth(),
          percent:
            aleph.left_Pyramid_yAxis_Left(ageBand) +
            aleph.left_Pyramid_yAxis_Left.bandwidth(),
        },
      });

      aleph.pyramidFullOutlineData[year][side].male.push({
        x: {
          count: d.value,
          percent: valueAsPercentageAgeBand,
        },
        y: {
          count: aleph.left_Pyramid_yAxis_Left(ageBand),
          percent: aleph.left_Pyramid_yAxis_Left(ageBand),
        },
      });

      aleph.pyramidFullData_v2[side][i].male.push({
        count: d.value,
        percent: valueAsPercentageAgeBand,
      });
    }); // end forEach Loop on male SYOAs

    /*


    FEMALES


    */

    SYOA_FemaleValues.forEach(function (d, i) {
      var age = aleph.SYOAs[i];
      var value = d.value;
      var valueAsPercentageAgeBand = (value / yearTotalPopulation) * 100;

      aleph.pyramidFullOutlineData[year][side].female.push({
        x: {
          count: value,
          percent: valueAsPercentageAgeBand,
        },
        y: {
          count:
            aleph.left_Pyramid_yAxis_Right(age) +
            aleph.left_Pyramid_yAxis_Right.bandwidth(),
          percent:
            aleph.left_Pyramid_yAxis_Right(age) +
            aleph.left_Pyramid_yAxis_Right.bandwidth(),
        },
      });

      aleph.pyramidFullOutlineData[year][side].female.push({
        x: {
          count: value,
          percent: valueAsPercentageAgeBand,
        },
        y: {
          count: aleph.left_Pyramid_yAxis_Right(age),
          percent: aleph.left_Pyramid_yAxis_Right(age),
        },
      });

      aleph.pyramidFullData_v2[side][i].female.push({
        count: d.value,
        percent: valueAsPercentageAgeBand,
      });
    }); // end forEach Loop on male SYOAs
  } // end for loop ...

  return;
} // end function mapYearsAgainstAges

/*





  NAME: determine_xAxisMaximumss 
  DESCRIPTION:
  ARGUMENTS TAKEN:
  ARGUMENTS RETURNED:
  CALLED FROM:
  CALLS:
*/
function determine_xAxisMaximums() {
  var counts = [];
  var percents = [];

  for (var property in aleph.pyramidFullData_v2) {
    var side = aleph.pyramidFullData_v2[property];

    side.forEach(function (d, i) {
      var SYOA = d;

      aleph.years.forEach(function (d, i) {
        counts.push(SYOA.male[i].count);
        percents.push(SYOA.male[i].percent);

        counts.push(SYOA.female[i].count);
        percents.push(SYOA.female[i].percent);
      }); // end forEach loop
    }); // end forEach loop
  } // end for obj loop

  aleph.xAxisMaximums.values.count = d3.max(counts);
  aleph.xAxisMaximums.values.percent = d3.max(percents);
} // end function determine_xAxisMaximums

/*





  NAME: changeOpposingPyramid 
  DESCRIPTION: function called if user updated a selction lisst on one pyramid, this function will auto update the otehr 'passive' pyramid
  ARGUMENTS TAKEN: pyramidSide - which pymriamid is being considered. 
  ARGUMENTS RETURNED: one
  CALLED FROM: buildPyramid()
  CALLS: pyramidOutlinePath(0)
*/
function changeOpposingPyramid(pyramidSide) {
  var opposingPyramid;

  // detemine which pyramid needs work on it ..
  if (pyramidSide == "left") {
    opposingPyramid = "right";
  } else {
    opposingPyramid = "left";
  }

  // update lefthand x axis for active/modified pyramid
  aleph.left_Pyramid_xAxis_Left.domain([
    0,
    Math.ceil(
      aleph.xAxisMaximums.values.percent / aleph.xAxisMaximums.roundings.percent
    ) * aleph.xAxisMaximums.roundings.percent,
  ]);

  // call and redraw new axis definition.
  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." + opposingPyramid + "_Pyramid_xAxis_Left"
    )
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left));

  // update FALSE lefthand x axis for active/modiifed pyramid
  aleph.left_Pyramid_xAxis_Left_FALSE.domain([
    Math.ceil(
      aleph.xAxisMaximums.values.percent / aleph.xAxisMaximums.roundings.percent
    ) * aleph.xAxisMaximums.roundings.percent,
    0,
  ]);

  // call and redraw new axis definition.
  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." +
      opposingPyramid +
      "_Pyramid_xAxis_Left_FALSE"
    )
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left_FALSE));

  // update righthand x axis for active/modifed pyramid
  aleph.left_Pyramid_xAxis_Right.domain([
    0,
    Math.ceil(
      aleph.xAxisMaximums.values.percent / aleph.xAxisMaximums.roundings.percent
    ) * aleph.xAxisMaximums.roundings.percent,
  ]);

  // call and redraw new axis definition.
  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." + opposingPyramid + "_Pyramid_xAxis_Right"
    )
    .call(d3.axisBottom(aleph.left_Pyramid_xAxis_Right));

  d3.selectAll(".aleph-xAxisTicks." + opposingPyramid + ".Left").remove();
  d3.selectAll(".aleph-xAxisTicks." + opposingPyramid + ".Right").remove();

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var xticks = d3
    .selectAll(".axis.axis--x." + opposingPyramid + "_Pyramid_xAxis_Left_FALSE")
    .selectAll(".tick");
  xticks
    .append("svg:line")
    .attr("class", "aleph-xAxisTicks " + opposingPyramid + " Left")
    .attr("y0", 0)
    .attr(
      "y1",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
    )
    .attr("x1", 0)
    .attr("x2", 0);

  // select tick grid lines extending from x-axis ticks on axis up graph
  var xticks = d3
    .selectAll(".axis.axis--x." + opposingPyramid + "_Pyramid_xAxis_Right")
    .selectAll(".tick");

  // append tick grid lines extending from x-axis ticks on axis up graph
  xticks
    .append("svg:line")
    .attr("class", "aleph-xAxisTicks " + opposingPyramid + " Right")
    .attr("y0", 0)
    .attr(
      "y1",
      -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
    )
    .attr("x1", 0)
    .attr("x2", 0);

  var tickCounter = -1;
  // modify display of set patttern of ticks on both x-axes
  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." +
      opposingPyramid +
      "_Pyramid_xAxis_Left_FALSE"
    )
    .selectAll(".tick")
    .style("display", function (d, i) {
      tickCounter++;
      if (tickCounter % 2 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  var tickCounter = -1;

  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(
      ".axis.axis--x.pyramid-xAxis." + opposingPyramid + "_Pyramid_xAxis_Right"
    )
    .selectAll(".tick")
    .style("display", function (d, i) {
      tickCounter++;
      if (tickCounter % 2 !== 0) {
        return "none";
      } else {
        return "inline";
      }
    });

  // select all lefthand data bars for selected pyramid
  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(".bar.leftBars." + opposingPyramid)
    .attr("x", function (d) {
      var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];
      return (
        aleph.left_Pyramid_xAxis_Left(
          aleph.left_Pyramid_xAxis_Left.domain()[0]
        ) +
        (1 - aleph.left_Pyramid_xAxis_Left(value)) -
        aleph.pyramidOffset
      );
    })
    .attr("width", function (d) {
      var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

      var rectWidth =
        aleph.left_Pyramid_xAxis_Left(
          aleph.left_Pyramid_xAxis_Left.domain()[0]
        ) - aleph.left_Pyramid_xAxis_Left(value);

      return Math.abs(rectWidth);
    });

  // select all righthand data bars for selected pyramid
  d3.selectAll(".aleph-chart.aleph-pyramid-chart")
    .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + opposingPyramid)
    .selectAll(".bar.rightBars." + opposingPyramid)
    .attr(
      "x",
      aleph.left_Pyramid_xAxis_Right(
        aleph.left_Pyramid_xAxis_Right.domain()[0]
      ) + aleph.pyramidOffset
    )
    .attr("width", function (d, i) {
      var value = d.female[aleph.pyramidYearIndex][aleph.countsPercents];
      return aleph.left_Pyramid_xAxis_Right(value);
    });

  // if user has left outlines unlocked ...
  if (aleph.freezeOutlines == "unlock") {
    // print solid path outlines to each pyramid halves..
    for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
      opposingPyramid
    ]) {
      aleph.pyramidGenderLineCurrentlyProcessing = gender;

      if (aleph.freezeOutlines == "lock") {
        pyramidHalfOutlineData =
          aleph.pyramidFullOutlineData[aleph.lockedYear][opposingPyramid][
          gender
          ];
      } else {
        pyramidHalfOutlineData =
          aleph.pyramidFullOutlineData[aleph.pyramidYear][opposingPyramid][
          gender
          ];
      }

      d3.selectAll(
        "." + opposingPyramid + ".aleph-pyramid-outline." + gender
      ).attr("d", pyramidOutlinePath(pyramidHalfOutlineData));
    } // end for loop ...
  } // end if ....

  return;
} // end function updatePyramids

/*





  NAME: setUpPyramidSlider 
  DESCRIPTION: function called to  
  ARGUMENTS TAKEN:  
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS: none
*/
function setUpPyramidSlider() {
  // Setter

  $("#pyramid-slider").slider("option", "value", Number(aleph.years[0]));
  $("#pyramid-slider").slider("option", "min", Number(aleph.years[0]));
  $("#pyramid-slider").slider(
    "option",
    "max",
    Number(aleph.years[aleph.years.length - 1])
  );

  return;
} // end function setUpPyramidSlider

function setPyramidDefaultAllSelected() {
  $("#pyramid-selectpicker-ethnicities-left").selectpicker("selectAll");
  $("#pyramid-selectpicker-ethnicities-right").selectpicker("selectAll");

  $("#pyramid-selectpicker-regions-left").selectpicker("selectAll");
  $("#pyramid-selectpicker-regions-right").selectpicker("selectAll");

  aleph.pyramidCurrentScenarios = {
    left: {
      ethnicities: [1, 2, 3, 4, 5, 6],
      regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    right: {
      ethnicities: [1, 2, 3, 4, 5, 6],
      regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  };

  return;
} // end function setPyramidDefaultAllSelected

$("#freezeOutlines").change(function () {
  // console.log($(this).prop("checked"));
  if ($(this).prop("checked") == false) {
    // console.log("IF:", $(this).prop("checked"));

    /* START NEW CODE */
    d3.selectAll(".aleph-pyramid-outline").classed("locked", false);
    /* END NEW CODE */

    d3.select("#pyramid-slider")
      .selectAll(".aleph-slider-year-label-locked-year-marker-span")
      .classed("aleph-hide", true)
      .style("left", aleph.lockedYearLeft_after);

    d3.select("#pyramid-slider")
      .selectAll(".locked-year")
      .style("left", aleph.lockedYearLeft)
      .classed("aleph-hide", true)
      .text("Locked at " + aleph.lockedYear);

    aleph.freezeOutlines = "unlock";

    aleph.pyramids.forEach(function (d) {
      var side = d;

      for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
        side
      ]) {
        aleph.pyramidGenderLineCurrentlyProcessing = gender;

        var pyramidHalfOutlineData =
          aleph.pyramidFullOutlineData[aleph.pyramidYear][side][gender];

        d3.selectAll("." + side + ".aleph-pyramid-outline." + gender).attr(
          "d",
          pyramidOutlinePath(pyramidHalfOutlineData)
        );
      } // end for loop ...
    }); // end forEach
  } else {
    console.log("ELSE:", $(this).prop("checked"));

    /* START NEW CODE */
    d3.selectAll(".aleph-pyramid-outline").classed("locked", true);

    /* END NEW CODE */

    aleph.freezeOutlines = "lock";
    aleph.lockedYear = $("#pyramid-slider").slider("option", "value");
    aleph.lockedYearLeft_before = d3
      .select("#pyramid-slider")
      .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
      .style("left")
      .replace("%", "");

    aleph.lockedYearLeft_after = Number(aleph.lockedYearLeft_before) + "%";
    d3.select("#pyramid-slider")
      .selectAll(".aleph-slider-year-label-locked-year-marker-span")
      .classed("aleph-hide", false)
      .style("left", aleph.lockedYearLeft_after);

    d3.select("#pyramid-slider")
      .selectAll(".locked-year")
      .style("left", aleph.lockedYearLeft_after)
      .classed("aleph-hide", false)
      .text("Locked at " + aleph.lockedYear);
  }

  return;
}); // end function freezeOutlines

$("#countsPercents").change(function () {
  /* START NEW CODE */
  $("#resetPyramids").prop("disabled", false).removeClass("aleph-disabled");
  /* END NEW CODE */

  d3.selectAll(".aleph-xAxisTicks").remove();

  // call fucntion to detemine new x axis maximums
  determine_xAxisMaximums();

  // locally store button reference
  var value = $(this).prop("checked");
  // console.log("countsPercents:", value);

  // loop through each pyramid ...
  aleph.pyramids.forEach(function (d, i) {
    // locally store which sides pyramid you are working on.
    var chartSide = d;

    // if current value is "count" , ie. display absolute coutns of population demographic.
    if (value == true) {
      // change button value and global value, and button text label displayed
      aleph.countsPercents = "count";

      aleph.chartMaximum =
        Math.ceil(
          aleph.xAxisMaximums.values.count / aleph.xAxisMaximums.roundings.count
        ) * aleph.xAxisMaximums.roundings.count;

      // update x axis title
      d3.selectAll(".aleph-pyramid-title").html(
        "Population in each age band (thousands)"
      );

      // update left hand x axis definition accordingly.
      aleph.left_Pyramid_xAxis_Left.domain([0, aleph.chartMaximum]);
      aleph.left_Pyramid_xAxis_Left_FALSE.domain([0, aleph.chartMaximum]);

      // update right hand x axis defintion accordingly.
      aleph.left_Pyramid_xAxis_Right.domain([0, aleph.chartMaximum]);
    } else {
      // button.value = "count";
      aleph.countsPercents = "percent";

      aleph.chartMaximum =
        Math.ceil(
          aleph.xAxisMaximums.values.percent /
          aleph.xAxisMaximums.roundings.percent
        ) * aleph.xAxisMaximums.roundings.percent;

      // update x axis title
      d3.selectAll(".aleph-pyramid-title").html(
        "Percentage of UK population in Age Band, by Gender"
      );

      // updarte defintion of left hand x axis
      aleph.left_Pyramid_xAxis_Left.domain([0, aleph.chartMaximum]);
      aleph.left_Pyramid_xAxis_Left_FALSE.domain([0, aleph.chartMaximum]);

      // // updarte defintion of right hand x axis
      aleph.left_Pyramid_xAxis_Right.domain([0, aleph.chartMaximum]);
    } // end else ...

    // call new axis defintion and redraw.
    d3.selectAll(
      ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left"
    ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left));

    // call update change to active FALSE lefthand x axis.
    d3.selectAll(
      ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left_FALSE"
    ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left_FALSE));

    // call new axis defintion and redraw.
    d3.selectAll(
      ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Right"
    ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Right));

    // update ticks accordingly on left hand pyramid side
    var xticks = d3
      .selectAll(".axis.axis--x." + chartSide + "_Pyramid_xAxis_Left_FALSE")
      .selectAll(".tick");

    // append new ticks ...
    xticks
      .append("svg:line")
      .attr("class", "aleph-xAxisTicks")
      .attr("y0", 0)
      .attr(
        "y1",
        -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
      )
      .attr("x1", 0)
      .attr("x2", 0);

    // update ticks accordingly on right hand pyramid side
    var xticks = d3
      .selectAll(".axis.axis--x." + chartSide + "_Pyramid_xAxis_Right")
      .selectAll(".tick");

    // append new ticks ...
    xticks
      .append("svg:line")
      .attr("class", "aleph-xAxisTicks")
      .attr("y0", 0)
      .attr(
        "y1",
        -svgHeight + aleph.pyramidMargin.top + aleph.pyramidMargin.bottom
      )
      .attr("x1", 0)
      .attr("x2", 0);

    // initialise tick counter ..
    var tickCounter = 0;

    // remove alternate LEFT x-axis labels
    d3.selectAll("." + chartSide + "_Pyramid_xAxis_Left_FALSE")
      .selectAll(".tick")
      .selectAll("text")
      .style("display", function () {
        if (tickCounter++ % 2 !== 0) d3.select(this).remove();
      })
      .text(function (d) {
        if (aleph.countsPercents == "count") {
          return (
            (aleph.left_Pyramid_xAxis_Left.domain()[1] - d).toFixed(0) / 1000
          );
        } else {
          return (aleph.left_Pyramid_xAxis_Left.domain()[1] - d).toFixed(1);
        }
      });

    // initialise tick counter ..
    tickCounter = 0;

    // remove alternate x-axis labels
    d3.selectAll("." + chartSide + "_Pyramid_xAxis_Right")
      .selectAll(".tick")
      .selectAll("text")
      .style("display", function () {
        if (tickCounter++ % 2 !== 0) d3.select(this).remove();
      })
      .text(function (d) {
        if (aleph.countsPercents == "count") {
          return d.toFixed(0) / 1000;
        } else {
          return d.toFixed(1);
        }
      });

    // update by transitioning left hand databars ...
    d3.selectAll(".bar.leftBars." + chartSide)
      .transition()
      .duration(aleph.pyramidTransitionLength)
      .ease(d3.easeLinear)
      .attr("x", function (d) {
        var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];
        return (
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ) +
          (1 - aleph.left_Pyramid_xAxis_Left(value)) -
          aleph.pyramidOffset
        );
      })
      .attr("width", function (d) {
        var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

        var rectWidth =
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ) - aleph.left_Pyramid_xAxis_Left(value);

        return Math.abs(rectWidth);
      });

    // update by transitioning right hand databars ...
    d3.selectAll(".bar.rightBars." + chartSide)
      .transition()
      .duration(aleph.pyramidTransitionLength)
      .ease(d3.easeLinear)
      .attr(
        "x",
        aleph.left_Pyramid_xAxis_Right(
          aleph.left_Pyramid_xAxis_Right.domain()[0]
        ) + aleph.pyramidOffset
      )
      .attr("width", function (d) {
        var value = d.female[aleph.pyramidYearIndex][aleph.countsPercents];
        return aleph.left_Pyramid_xAxis_Right(value);
      });

    // update solid path outlines to each pyramid halves..
    for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
      chartSide
    ]) {
      aleph.pyramidGenderLineCurrentlyProcessing = gender;

      // if user has locked outlines during transitioning ...
      if (aleph.freezeOutlines == "lock") {
        pyramidHalfOutlineData =
          aleph.pyramidFullOutlineData[aleph.lockedYear][chartSide][gender];
      }

      // if user has not locked outlines during transitioning ...
      else {
        pyramidHalfOutlineData =
          aleph.pyramidFullOutlineData[aleph.pyramidYear][chartSide][gender];
      }

      d3.selectAll("." + chartSide + ".aleph-pyramid-outline." + gender).attr(
        "d",
        pyramidOutlinePath(pyramidHalfOutlineData)
      );
    } // end for loop ...
  }); // end forEach

  return;
}); // end function countsPercents

$("#pyramid-playStop").change(function () {
  if ($(this).prop("checked") == false) {
    console.log($(this).prop("checked"));

    myStopFunction();
  } else {
    console.log($(this).prop("checked"));

    /* START NEW CODE */
    $("#resetPyramids").prop("disabled", false).removeClass("aleph-disabled");
    /* END NEW CODE */

    // setup time interval call.
    aleph.myPopPyramidSetInterval = setInterval(myTimer, aleph.setInterval);

    // function to call when user has requested play loop
    function myTimer() {
      aleph.pyramidYearIndex++;

      if (aleph.pyramidYearIndex > aleph.years.length - 1) {
        aleph.pyramidYearIndex = 0;
      }
      aleph.pyramidYear = aleph.years[aleph.pyramidYearIndex];

      d3.selectAll(".selected-year")
        .classed("aleph-hide", false)
        .text(aleph.pyramidYear);

      $("#pyramid-slider").slider("option", "value", aleph.pyramidYear);
      transitionPyramidChart();
      updateInformationLabels();
    }
  }
}); // end function

/* START NEW CODE */
function resetPyramids(button) {
  // return main reset button to inactive/disabled state
  $("#resetPyramids").prop("disabled", true).addClass("aleph-disabled");

  //reset selected year variables to starting data year, and update slider/move slider handle to start
  aleph.pyramidYear = aleph.years[0];
  aleph.pyramidYearIndex = aleph.years.indexOf(aleph.pyramidYear.toString());

  d3.select("#pyramid-slider")
    .selectAll(".selected-year")
    .classed("aleph-hide", true)
    .text(aleph.pyramidYear);

  $("#pyramid-slider").slider("option", "value", aleph.pyramidYear);

  updateInformationLabels();
  initialisePyramidSelectionCriteriaObjects(); // reset container object deifning current user selctions on selctor lists

  // reset vars relating to pyramid mouse interaction
  aleph.mouseState = "up";
  aleph.mouseDragState = false;
  aleph.pyramidDataBarClicked = false;

  // update relevant DOM elements and aleph object vars relating to freezing/unfreezing pyramid outlines
  d3.selectAll(".aleph-pyramid-outline").classed("locked", false); // reset outline paths to default colour fill styling
  $("#freezeOutlines").bootstrapToggle("off"); // reset toggle to off
  aleph.freezeOutlines = "unlock";

  // update relvnt DOM elements and aleph object vars relating to counts/percentages views
  $("#countsPercents").bootstrapToggle("off");
  aleph.countsPercents = "percent";

  var lists = ["ethnicities", "regions"];

  aleph.pyramidCurrentScenarios = {
    left: {
      ethnicities: [1, 2, 3, 4, 5, 6],
      regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    right: {
      ethnicities: [1, 2, 3, 4, 5, 6],
      regions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  };

  aleph.pyramids.forEach(function (d, i) {
    // call function to add new selection lists

    addPyramidSelectionLists(d);
  }); // end forEach

  setPyramidDefaultAllSelected(); // function to default all bootstrap selection lists across charts

  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.pyramidChart.incompleteSelections"
  ).classed("aleph-hide", true);

  $(".btn.dropdown-toggle").removeClass("btn-danger").addClass("btn-primary");

  // loop through each pyramid, completely rebuilding it as if onloading
  aleph.pyramids.forEach(function (d) {
    // call function to build both new pyramids
    buildPyramids(d, "onload");
  }); // end forEach

  return;
} // end function resetPyramids

function actionPyramidSelectDeselectAll(l, side, b) {
  if (aleph.selectAll) {
    aleph.pyramidCurrentScenarios[side][l] =
      aleph.selectionListConfigurations.pyramid[l]["full-array"];

    if (l == "ethnicities") {
      d3.selectAll("." + l + "-selections-" + side).text("All Ethnicities");
    }
    if (l == "regions") {
      d3.selectAll("." + l + "-selections-" + side).text("All Regions");
    }
  } else {
    aleph.pyramidCurrentScenarios[side][l] = [];
    $(b).removeClass("btn-primary").addClass("btn-danger");
  }

  return;
} // end function actionPyramidSelectDeselectAll()

/* END NEW CODE */

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
