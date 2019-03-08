function makeChords(csv_file, modelDiv, obsDiv, dest_filter){

  var svg1;
  var svg2;
  var dest;
  var modelData;
  var obsData;

  var w = 580,
      h = 500,
      r1 = h / 2,
      r0 = r1 - 110;

  var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending);

  var arc = d3.arc()
      .innerRadius(r0)
      .outerRadius(r0 + 20);

  var ribbon = d3.ribbon()
      .radius(r0)


  var dest = d3.select(dest_filter).property('value');
  //dest = 1;
  //d3.select(dest).on('change', update);

    d3.csv(csv_file, function(error, data) {

              //d3.select(dest_filter).on('change', update);

              //dest = d3.select(dest_filter).property('value');


              function mdata(dest){
                var modelData = data.filter(function(d){
                  //console.log(d)
                  if (d.Category == "Model" & d.node == dest){
                    return data;
                  };
                });
                return modelData
              };

              function odata(dest){
                var obsData = data.filter(function(d){
                  //console.log(d)
                  if (d.Category == "Survey" & d.node == dest){
                    return data;
                  };
                });

                return obsData
              };

              dest = d3.select(dest_filter).property('value');

              modelData = mdata(dest);
              obsData = odata(dest);

              console.log(modelData)
              var mpr = chordMpr(modelData);
              mpr.addValuesToMap('root')
                  .addValuesToMap('node')
                  .setFilter(function(row, a, b) {
                      return (row.root === a.name && row.node === b.name)
                  })
                  .setAccessor(function(recs, a, b) {
                      if (!recs[0]) return 0;
                      return +recs[0].count;
                  });

              console.log(obsData)
              var ompr = chordMpr(obsData);
              ompr.addValuesToMap('root')
                  .addValuesToMap('node')
                  .setFilter(function(row, a, b) {
                      return (row.root === a.name && row.node === b.name)
                  })
                  .setAccessor(function(recs, a, b) {
                      if (!recs[0]) return 0;
                      return +recs[0].count;
                  });

              svg1 = init(obsDiv,ompr.getMatrix());
              svg2 = init(modelDiv,mpr.getMatrix());

              update();
              function update(){
                dest = d3.select(dest_filter).property('value');

                modelData = mdata(dest);
                obsData = odata(dest);

                console.log(modelData)
                var mpr = chordMpr(modelData);
                mpr.addValuesToMap('root')
                    .addValuesToMap('node')
                    .setFilter(function(row, a, b) {
                        return (row.root === a.name && row.node === b.name)
                    })
                    .setAccessor(function(recs, a, b) {
                        if (!recs[0]) return 0;
                        return +recs[0].count;
                    });

                console.log(obsData)
                var ompr = chordMpr(obsData);
                ompr.addValuesToMap('root')
                    .addValuesToMap('node')
                    .setFilter(function(row, a, b) {
                        return (row.root === a.name && row.node === b.name)
                    })
                    .setAccessor(function(recs, a, b) {
                        if (!recs[0]) return 0;
                        return +recs[0].count;
                    });

                drawChords(svg1, mpr.getMatrix(), mpr.getMap());
                drawChords(svg2, ompr.getMatrix(), ompr.getMap());
                //drawMap();
              }
          });

          function fade(opacity) {
            return function(d, i) {
              var activeDistrict = i;
              svg1.selectAll("path.chord")
                  .filter(function(d) { return d.source.index != activeDistrict && d.target.index != activeDistrict; })
          		.transition()
                  .style("stroke-opacity", opacity)
                  .style("fill-opacity", opacity);

              svg2.selectAll("path.chord")
                  .filter(function(d) { return d.source.index != activeDistrict && d.target.index != activeDistrict; })
          		.transition()
                  .style("stroke-opacity", opacity)
                  .style("fill-opacity", opacity);
            };
          }

          function init(divID, matrix){

            svg = d3.select("#" + divID).append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("id", "circle")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
                .datum(chord(matrix));

            svg.append("circle")
                .attr("r", r0 + 20);

            return svg;
          }

          function drawChords(svg, matrix, mmap) {

              var mapReader = chordRdr(matrix, mmap);

              var g = svg.selectAll("g.group")
                  .data(function(chords) {
                      return chords.groups;
                  })
                  .enter().append("svg:g")
                  .attr("class", "group")
                  .on("mouseover", fade(.02))
                	.on("mouseout", fade(.80));

              g.append("svg:path")
                  .style("stroke", "grey")
                  .style("fill", function(d) {
                      return mapReader(d).gdata;
                  })
                  .attr("d", arc);

              g.append("svg:text")
                  .each(function(d) {
                      d.angle = (d.startAngle + d.endAngle) / 2;
                  })
                  .attr("dy", ".35em")
                  .style("font-family", "helvetica, arial, sans-serif")
                  .style("font-size", "9px")
                  .attr("text-anchor", function(d) {
                      return d.angle > Math.PI ? "end" : null;
                  })
                  .attr("transform", function(d) {
                      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                          "translate(" + (r0 + 26) + ")" +
                          (d.angle > Math.PI ? "rotate(180)" : "");
                  })
                  .text(function(d) {
                      return mapReader(d).gname;
                  });

              var colors = d3.scaleOrdinal(d3.schemeCategory20c);

              var chordPaths = svg.selectAll("path.chord")
                  .data(function(chords) {
                      return chords;
                  })
                  .enter().append("svg:path")
                  .attr("class", "chord")
                  .style("stroke", "grey")
                  .style("fill", function(d, i) {
                      return colors(i)
                  })
                  .attr("d", ribbon.radius(r0))


          };

}