function makeGroupHBar(csv_file, chartID, nogroups, dataDescription, dtitle, height, word, scale, xaxis) {

  var ngroups = nogroups + 1
  var margin = { top: 35, right: 80, bottom: 100, left: 150 },
    width = 400 - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

  var g = d3.select(chartID).append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 -10 350 600")
    .attr("align", "center")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var y0 = d3.scaleBand()
    .rangeRound([height, 0])
    .paddingInner(0.1);
  var y1 = d3.scaleBand()
    .padding(0.05);
  var x = d3.scaleLinear()
    .rangeRound([0, width]);

  //Review axis labels
  let xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2s")),
    yAxis = d3.axisLeft(y0).ticks(null, "s");

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")");

  g.append("g")
    .attr("class", "axis axis--y");

  var z = d3.scaleOrdinal()
    .range(["#0E84AC", "#548E3F"]);

  var durations = 0;

  let afterLoad = () => durations = 750;

  var keys, copy;

  var keysLegend = [];

  d3.queue()
    .defer(d3.csv, csv_file, function (d, i, columns) {
      for (var i = 1, ttl = 0, n = columns.length; i < n; ++i)
        d.chartCat = d.Category;
      d.dataType = d.Type;
      d.descr = d.Description;
      d.title = d.Title;
      ttl += d[columns[i]] = +d[columns[i]];
      d.total = ttl
      d.M = parseInt(d.Model)
      d.S = parseInt(d.Survey)
      d.Model = d.M
      d.Survey = d.S
      return d;
    })
    .await(function (error, data) {

      if (error) throw error;
      init();
      update();

      function init() {
        sortIndex = data.map(function (d) {
          return d.Index
        });
      }

      function update() {
        keys = data.columns.slice(1, ngroups); //Filter columns for Group Labels
        copy = [];
        keys.forEach(function (t) {
          t = t.slice(0)    //Slice column label to select subgroup
          copy.push(t)
        })

        var copyKeys = keys;

        keysLegend = []

        copyKeys.forEach(function (s) {
          s = s.slice(0)  //Slice column label to select subgroup
          keysLegend.push(s)
        })

        data.forEach(function (d, i, columns) {
          for (var i = 0, test = 0, n = keysLegend.length; i < n; ++i)
            test += d[keysLegend[i]];
          d.totalSlice = test;
          divText = "Table Description: " + d.Description;
          divTitle = d.Title;
          return d;
        })

        // ======== Domain, Axis & Sort ========

        if (xaxis != 0) {
          x.domain([0, xaxis]).nice();
        }

        if (xaxis == 0) {
          x.domain([0, d3.max(data, function (d) {
            return d3.max(copy, function (key) {
              return +d[key];
            });
          })
          ]).nice();
        }


        g.selectAll(".axis.axis--x").transition()
          .duration(durations)
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

        var barGroups = g.selectAll(".layer") // Bargroups initialized here for proper sorting
          .data(data, function (d) {
            return d.Index
          }); // DON'T FORGET KEY FUNCTION

        barGroups.enter().append("g")
          .classed('layer', true)
          .attr('line', function (d) {
            return d.Index;
          })

        barGroups.exit().remove();

        y0.domain(data.map(function (d) { return d.Index; }));
        y1.domain(keys).rangeRound([0, y0.bandwidth()]);

        g.selectAll(".axis.axis--y").transition()
          .duration(durations)
          .call(yAxis);

        // ======== Grouped bars ========

        g.selectAll(".layer").transition().duration(durations)
          .attr("transform", function (d, i) {
            return "translate(0," + y0(d["Index"]) + ")";
          });

        let bars = g.selectAll(".layer").selectAll("rect")
          .data(function (d) {
            return copy.map(function (key) {
              return {
                key: key, value: d[key], lines: d.Index, order: d.order
              };
            });
          });

        bars = bars
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", function (d) { return y1(d.key) })
          .attr("width", function (d) {
            return x(d.value);
          })
          .attr("height", y1.bandwidth())
          .attr("fill", function (d) { return z(d.key); })
          .merge(bars)
          .on("mouseover", function (d) {
            var div = d3.select("body").append("div")
              .attr("class", "vmttooltip2")
              .style("opacity", 0);
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html(
              "<p style='color:#8a89a6; font-size: 20px; margin-bottom: 0px;'>" + d3.formatPrefix(".2s", scale)(d.value) +
              "</p><p style='color:grey; font-size: 10px;'>" + word + "</p>"
            )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px")


            d3.selectAll("." + d.lines.replace(/\s/g, '').replace(/\//g, '-').replace(/&/g, '').replace(/\(|\)/g, ""))
              .attr("fill", "#cf4446");
            selectedline = d.lines.replace(/\s/g, '').replace(/\//g, '-').replace(/&/g, '').replace(/\(|\)/g, "")
            selectednumber = d.order;

            // this highlights the line on the map!
            metra1.eachLayer(function (layer) {
              if (selectedline == "BNSF") {
                linecolormetra = "#32CD32"
              } else if (selectedline == "UPNorth") {
                linecolormetra = "#006400"
              } else if (selectedline == "UP-W") {
                linecolormetra = "#DB7093"
              } else if (selectedline == "UP-NW") {
                linecolormetra = "#cccc00"
              } else if (selectedline == "ME") {
                linecolormetra = "#FF4500"
              } else if (selectedline == "RI") {
                linecolormetra = "#FF0000"
              } else if (selectedline == "MD-W") {
                linecolormetra = "#ffc04c"
              } else if (selectedline == "MD-N") {
                linecolormetra = "#FF8C00"
              } else if (selectedline == "SWS") {
                linecolormetra = "#0000FF"
              } else if (selectedline == "HC") {
                linecolormetra = "#570632"
              } else if (selectedline == "NCS") {
                linecolormetra = "#5d198e"
              } else {
                linecolormetra = "#0052a7"
              }
              if (layer.LINE.includes(selectedline)) {
                layer.setStyle({
                  color: linecolormetra,
                  weight: 3
                })
              }
            })
            cta1.eachLayer(function (layer) {
              if (selectedline == "RedLine") {
                linecolor = "#FF0000"
              } else if (selectedline == "BlueLine") {
                linecolor = "#0000FF"
              } else if (selectedline == "BrownLine") {
                linecolor = "#8B4513"
              } else if (selectedline == "GreenLine") {
                linecolor = "#008000"
              } else if (selectedline == "OrangeLine") {
                linecolor = "#FF8C00"
              } else if (selectedline == "PinkLine") {
                linecolor = "#ea4797"
              } else if (selectedline == "PurpleLine") {
                linecolor = "#800080"
              } else if (selectedline == "YellowLine") {
                linecolor = "#999900"
              } else {
                linecolor = "#cf4446"
              }
              if (layer.LINE.includes(selectedline)) {
                layer.setStyle({
                  color: linecolor,
                  weight: 3
                })
              }
            })
            hwy_lyr.eachLayer(function (layer) {
              if (layer.feature.properties.abmnum == selectednumber) {
                layer.setStyle({
                  color: "#cf4446"
                })
              }
            })
          })

          .on("mouseout", function (d) {
            d3.selectAll(".vmttooltip2")
              .remove();

            d3.selectAll("." + d.lines.replace(/\s/g, '').replace(/\//g, '-').replace(/&/g, '').replace(/\(|\)/g, ""))
              .attr("fill", function (d) {
                return z[1];
              });
            selectedline = d.lines.replace(/\s/g, '').replace(/\//g, '-').replace(/&/g, '').replace(/\(|\)/g, "")
            selectednumber = d.order;

            // this highlights the line on the map!
            metra1.eachLayer(function (layer) {
              if (layer.LINE.includes(selectedline)) {
                layer.setStyle({
                  color: '#696969',
                  weight: 2
                })
              }
            })
            cta1.eachLayer(function (layer) {
              if (layer.LINE.includes(selectedline)) {
                layer.setStyle({
                  color: "black",
                  weight: 2
                })
              }
            })

            hwy_lyr.eachLayer(function (layer) {
              if (layer.feature.properties.abmnum == selectednumber) {
                layer.setStyle({
                  color: "grey"
                })
              }
            })
          });


        bars.transition().duration(durations)
          .attr("x", 0)
          .attr("width", function (d) {
            return x(d["value"]);
          });

      } // End of update function

      afterLoad();

      // End of ready
    });
}
