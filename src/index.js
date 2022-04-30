import * as d3 from "d3";

import miserables from "../data/miserables.json";

const nodeId = (d) => d.id;
const labelWidth = (d) => d.id.length * 9;
const labelX = (d) => (-1 * labelWidth(d)) / 2;

const textHeight = 15; // Approx
const labelYOffset = 10;
const labelHeight = 20;

function makeGraph(graph, options) {
  const { width, height } = options;

  const color = d3.scaleOrdinal(d3.schemeSet3);

  const tooltip = d3
    .select("#app")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const forceCharge = d3.forceManyBody().strength(-100);

  const simulation = d3
    .forceSimulation()
    .nodes(graph.nodes)
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("charge", forceCharge)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  simulation.force("link").links(graph.links);

  const circleRadius = 6;

  let link = svg.selectAll("line").data(graph.links).enter().append("line");

  link
    .attr("class", "link")
    .on("mouseover.tooltip", function (event, link) {
      const [x, y] = d3.pointer(event);
      tooltip.transition().duration(300).style("opacity", 0.8);
      tooltip
        .html(
          "Source:" +
            link.source.id +
            "<p/>Target:" +
            link.target.id +
            "<p/>Strength:" +
            link.value
        )
        .style("left", x + "px")
        .style("top", y + 10 + "px");
    })
    .on("mouseout.tooltip", function () {
      tooltip.transition().duration(100).style("opacity", 0);
    })
    // .on("mouseout.fade", fade(1));
    .on("mousemove", function (event) {
      const [x, y] = d3.pointer(event);
      tooltip.style("left", x + "px").style("top", y + 10 + "px");
    });

  const node = svg
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node
    .append("rect")
    .attr("x", labelX)
    .attr("y", labelYOffset)
    .attr("width", labelWidth)
    .attr("height", labelHeight)
    .attr("fill", "#eee")
    .attr("fill-opacity", 0.8);

  node
    .append("text")
    .attr("x", (d) => labelX(d) + 10)
    .attr("y", labelYOffset + textHeight)
    .attr("font-size", "0.8em")
    .text(nodeId);

  node
    .append("circle")
    .attr("r", circleRadius)
    .attr("fill", function (d) {
      return color(d.group);
    })
    // .on("mouseover.tooltip", function (event, node) {
    //   const { x, y } = node;
    //   tooltip.transition().duration(300).style("opacity", 0.8);
    //   tooltip
    //     .html("Name:" + node.id + "<p/>group:" + node.group)
    //     .style("left", x + "px")
    //     .style("top", y + 10 + "px");
    // })
    .on("mouseover.fade", fade(0.1))
    // .on("mouseout.tooltip", function () {
    //   tooltip.transition().duration(100).style("opacity", 0);
    // })
    .on("mouseout.fade", fade(1));
  // .on("mousemove", function (event, node) {
  //   const { x, y } = node;
  //   tooltip.style("left", x + "px").style("top", y + 10 + "px");
  // })
  // .on("dblclick", releasenode);

  node
    .append("text")
    .attr("x", 0)
    .attr("dy", ".35em")
    .text((d) => d.name);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    const [x, y] = d3.pointer(event);
    d.fx = x;
    d.fy = y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
  }

  // TODO: Is this needed?
  // function releasenode(d) {
  //   d.fx = null;
  //   d.fy = null;
  // }

  const linkedByIndex = {};

  graph.links.forEach((d) => {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });

  function isConnected(a, b) {
    return (
      linkedByIndex[`${a.index},${b.index}`] ||
      linkedByIndex[`${b.index},${a.index}`] ||
      a.index === b.index
    );
  }

  function fade(opacity) {
    return (event, d) => {
      node.style("stroke-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute("fill-opacity", thisOpacity);
        return thisOpacity;
      });

      link.style("stroke-opacity", (o) =>
        o.source === d || o.target === d ? 1 : opacity
      );
    };
  }

  // var sequentialScale = d3
  //   .scaleOrdinal(d3.schemeSet3)
  //   .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // svg
  //   .append("g")
  //   .attr("class", "legendSequential")
  //   .attr(
  //     "transform",
  //     "translate(" + (width - 140) + "," + (height - 300) + ")"
  //   );

  // var legendSequential = d3
  //   .legendColor()
  //   .shapeWidth(30)
  //   .cells(11)
  //   .orient("vertical")
  //   .title("Group number by color:")
  //   .titleWidth(100)
  //   .scale(sequentialScale);

  // svg.select(".legendSequential").call(legendSequential);

  return svg.node();
}

const appEl = document.getElementById("app");
const { offsetWidth, offsetHeight } = appEl;

const graphEl = makeGraph(miserables, {
  width: offsetWidth,
  height: offsetHeight,
});

appEl.appendChild(graphEl);
