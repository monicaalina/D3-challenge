
var svgWidth = 1500;
var svgHeight = window.innerHeight;


var margin = {
  top: 20, 
  right: 40, 
  bottom: 200,
  left: 100
};


var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//Append an svg group
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// Function for updating the x-scale variable upon click of label
function xScale(census, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(census, d => d[chosenXAxis]) * 0.8,
        d3.max(census, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);

    return xLinearScale;
}

// Function for updating y-scale variable upon click of label
function yScale(census, chosenYAxis) {
  // Create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(census, d => d[chosenYAxis]) * 0.8,
      d3.max(census, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}

// Function for updating the xAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

// Function for updating the yAxis upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

// Function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

// Function for showing the state abbreviations
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}

// Function to infer approximate values for each circle
function styleX(chosenXAxis, value) {


    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }

    else if (chosenXAxis === 'age'){
      return `${value}`;
    }
}

// Funtion for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var XLabel;

    if (chosenXAxis === 'poverty') {
      XLabel = 'Poverty:';
    }
    
    else if (chosenXAxis === 'income'){
      XLabel = 'Median Income:';
    }
    
    else if (chosenXAxis === 'age'){
      XLabel = 'Age:';
    }

    var YLabel;

    if (chosenYAxis ==='healthcare') {
      YLabel = "No Healthcare:"
  }

    else if(chosenYAxis === 'obesity') {
      YLabel = 'Obesity:';
  }

  
    else if(chosenXAxis === 'smokes'){
      YLabel = 'Smokers:';
  }

  
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${XLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${YLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  // Onmouseout event
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;

}

// Retrieve data from the CSV file and execute everything below
d3.csv('./assets/data/data.csv').then(function(census) {

    console.log(census);
    
    // Parse data
    census.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(census, chosenXAxis);
    var yLinearScale = yScale(census, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append X axis
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    // Append Y axis
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      .call(leftAxis);
    
    // Append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(census)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 15)
      .attr('opacity', '.5');

    // Append initial text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(census)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '8px')
      .text(function(d){return d.abbr});

    // Create group for X axis labels
    var XLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 15})`);

    var PovertyLabel = XLabelsGroup.append('text')      
      .classed('aText', true)
      .attr('x', 0)
      .attr('y', 15)
      .attr('value', 'poverty')
      .classed('active', true)
      .text('In Poverty (%)');
      
    var AgeLabel = XLabelsGroup.append('text')      
      .classed('aText', true)
      .attr('x', 0)
      .attr('y', 30)
      .attr('value', 'age')
      .classed('inactive', true)
      .text('Age (Median)');  

    var IncomeLabel = XLabelsGroup.append('text')      
      .classed('aText', true)
      .attr('x', 0)
      .attr('y', 45)
      .attr('value', 'income')
      .classed('inactive', true)
      .text('Household Income (Median)')

    // Create group for Y axis labels
    var YLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/2}, ${height/2})`);

    var HealthCareLabel = YLabelsGroup.append('text')      
      .classed('aText', true)
      .attr('transform', 'rotate(-90)')
      .attr('x', 0)
      .attr('y', 0 - 10)
      .attr('dy', '1em')      
      .attr('value', 'healthcare')
      .classed('active', true)
      .text('Without Healthcare (%)');
    
    var SmokesLabel = YLabelsGroup.append('text')
      .classed('aText', true)
      .attr('transform', 'rotate(-90)')     
      .attr('x', 0)
      .attr('y', 0 - 30)
      .attr('dy', '1em')
      .attr('value', 'smokes')
      .classed('inactive', true)
      .text('Smoker (%)');
    
    var ObesityLabel = YLabelsGroup.append('text')
      .classed('aText', true)
      .attr('transform', 'rotate(-90)')      
      .attr('x', 0)
      .attr('y', 0 - 45)
      .attr('dy', '1em')     
      .attr('value', 'obesity')
      .classed('inactive', true)
      .text('Obese (%)');
    
    // UpdateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    XLabelsGroup.selectAll('text')
      .on('click', function() {
        // Get value of selection
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          // Replace chosen x with value
          chosenXAxis = value; 

          // console.log(chosenXAxis)

          // Functions here found above csv import
          // Updates x scale for new data
          xLinearScale = xScale(census, chosenXAxis);

          // Update X axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // Upate circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update text 
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update tooltips with new information
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Change of classes to change bold text
          if (chosenXAxis === 'poverty') {
            PovertyLabel
              .classed('active', true)
              .classed('inactive', false);
            AgeLabel
              .classed('active', false)
              .classed('inactive', true);
            IncomeLabel
              .classed('active', false)
              .classed('inactive', true);
          }

          else if (chosenXAxis === 'age') {
            PovertyLabel
              .classed('active', false)
              .classed('inactive', true);
            AgeLabel
              .classed('active', true)
              .classed('inactive', false);
            IncomeLabel
              .classed('active', false)
              .classed('inactive', true);
          }

          else if (chosenXAxis === 'income') {
            PovertyLabel
              .classed('active', false)
              .classed('inactive', true);
            AgeLabel
              .classed('active', false)
              .classed('inactive', true);
            IncomeLabel
              .classed('active', true)
              .classed('inactive', false);
          }
        }
      });

    // Y axis labels event listener
    YLabelsGroup.selectAll('text')
      .on('click', function() {
        // Get value of selection
        var value = d3.select(this).attr('value');
        if(value !=chosenYAxis) {

            // Replaces chosenYAxis with value  
            chosenYAxis = value;

            // console.log(chosenYAxis)

            // Functions here found above csv import
            // Updates Y scale for new data
            yLinearScale = yScale(census, chosenYAxis);

            // Updates Y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Updates circles with new Y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Updates state text with new Y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update tooltips with new information
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Changes classes to change bold text

            if (chosenYAxis === 'obesity') {
              ObesityLabel
                .classed('active', true)
                .classed('inactive', false);
              SmokesLabel
                .classed('active', false)
                .classed('inactive', true);
              HealthCareLabel
                .classed('active', false)
                .classed('inactive', true);
            }

            else if (chosenYAxis === 'smokes') {
              ObesityLabel
                .classed('active', false)
                .classed('inactive', true);
              SmokesLabel
                .classed('active', true)
                .classed('inactive', false);
              HealthCareLabel
                .classed('active', false)
                .classed('inactive', true);
            }

            else if (chosenYAxis === 'helath care'){
              ObesityLabel
                .classed('active', false)
                .classed('inactive', true);
              SmokesLabel
                .classed('active', false)
                .classed('inactive', true);
              HealthcareLabel
                .classed('active', true)
                .classed('inactive', false);
            }
          }
        });
});