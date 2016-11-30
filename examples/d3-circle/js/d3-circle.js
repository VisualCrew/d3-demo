/**
 * 本模块受http://bl.ocks.org/clayzermk1/9142407和http://bl.ocks.org/mbostock/4063269启发。
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3'], factory);
  } else if (typeof exports === 'object' && module.exports) {
    module.exports = factory(require('d3'));
  } else {
    root.returnExports = factory(root.d3);
  }
} (this, function (d3) {
  // exposed methods
  function circle() {
    'use strict';
    // Public variables width default settings
    var width = 960;
    var height = 960;
    var backgroundColor = '#fff';

    var value;

    var orbitColor = ['#5185dd', '#4199ca'];
    var orbitWidth = 1;
    var trackBall = 12;
    var ballSize = [12, 24];

    var textAfterEdge = '';
    var textAfterEdgeColor = '#000';
    var textAfterEdgeSize = 24;
    var textAfterEdgeStartOffset = '20%';
    var textAfterEdgeDxDy = ['15px', '-5px'];
    var textAfterEdgeDominantBaseline = 'text-after-edge';
    var textBeforeEdge = '';
    var textBeforeEdgeColor = '#000';
    var textBeforeEdgeSize = 20;
    var textBeforeEdgeStartOffset = '20%'
    var textBeforeEdgeDxDy = ['30px', '5px'];
    var textBeforeEdgeDominantBaseline = 'text-before-edge';

    // Private variables
    var acos = 0;
    var defaultData = ['提供数据总量', 0, '提供数据部委总量', 0, '提供数据部委占比', 0];

    function circle(selection) {
      var orbitColorScale = d3.scaleLinear()
        .domain([0, trackBall])
        .range([orbitColor[0], orbitColor[1]]);
      var ballSizeScale = d3.scaleLinear()
        .domain([0, trackBall])
        .rangeRound([ballSize[1], ballSize[0]]);
      var radius = Math.min(width, height);
      var radii = {
        'sun': radius / 8,
        'earthOrbit': radius / 3,
        'rectArea': Math.sqrt(Math.pow(radius * .8, 2) / 2)
      };
      var tooltip = selection.append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0.0);

      selection.each(function () {
        // Current position of Text in its orbit
        var textOrbitPosition = d3.arc()
          .outerRadius(radii.earthOrbit + 1)
          .innerRadius(radii.earthOrbit - 1)
          .startAngle(2 * Math.PI * 3 / 4)
          .endAngle(2 * Math.PI);

        // Space
        var svg = d3.select(this).append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background-color', backgroundColor)
          .append('g')
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Sun
        createRectArea(svg);
        // Earth's orbit
        createOrbit(svg);

        if (value) {
          createCircle(svg);
        }
        createText(svg);

        function render(data) {
          // d3.selectAll('.tspan')
          //     .data(data)
          //     .text(function(d) {
          //         return d;
          //     });
        }
        // 创建圆
        function createCircle(dom) {
          var node = dom.selectAll('.node')
            .data(value)
            .enter()
            .append('g')
            .attr('class', 'node');
          node.append('circle')
            .attr('id', function (d) { return d.id; })
            .attr('r', function (d, i) { return ballSizeScale(i); })
            .style('fill', function (d, i) { return orbitColorScale(i); });
          node.append('clipPath')
            .attr('id', function (d) { return 'clip-' + d.id; })
            .append('use')
            .attr('xlink:href', function (d) { return '#' + d.id; });
          node.append('text')
            .attr('clip-path', function (d) { return 'url(#clip-' + d.id + ')'; })
            .append('tspan')
            .attr('x', function (d, i) { return i < 9 ? (-ballSizeScale(i) * .2) : (-ballSizeScale(i) * .4) })
            .attr('y', function (d, i) { return ballSizeScale(i) * .2 })
            .style('fill', 'white')
            .style('font-size', function (d, i) { return ballSizeScale(i) * .8; })
            .text(function (d, i) { return i + 1; });
          node.append('title')
            .text(function (d, i) { return i + 1; });
          // node.append('text')
          //     .attr('x', function(d, i, nodes) {
          //         return i < 7 ? 50 : -35;
          //     })
          //     .attr('y', function(d, i, nodes) {
          //         return 13 + (i - nodes.length / 2);
          //     })
          //     .style('fill', 'block')
          //     .text(function(d) {
          //         return d.name;
          //     });
          node.each(function (d, i) {
            var hudu = (i + 0) * (2 * Math.PI / trackBall);
            var X = Math.sin(hudu) * (radii.earthOrbit + ballSizeScale(i));
            var Y = Math.cos(hudu) * (radii.earthOrbit + ballSizeScale(i));
            d3.select(this).attr('transform', 'translate(' + X + ',' + -Y + ')');

            var a, b, c;
            a = radii.earthOrbit + ballSizeScale(i);
            b = radii.earthOrbit + ballSizeScale(i + 1);
            c = ballSizeScale(i) + ballSizeScale(i + 1);
            // console.log('a----->' + a);
            // console.log('b----->' + b);
            // console.log('c----->' + c);
            var cosc = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);
            acos += Math.acos(cosc);

            var X1 = Math.sin(acos) * (radii.earthOrbit + ballSizeScale(i));
            var Y1 = Math.cos(acos) * (radii.earthOrbit + ballSizeScale(i));
            d3.select(this).attr('transform', 'translate(' + X1 + ',' + -Y1 + ')');

            // d3.select(this).on('click', function(d) {
            //     defaultData.splice(1, 1, d.data.zongliang);
            //     defaultData.splice(3, 1, d.data.buliang);
            //     defaultData.splice(5, 1, d.data.zhanbi);
            //     render(defaultData);
            // });
            d3.select(this).on('mouseover', function (d) {
              tooltip.html(d.name + '<br />' +
                '排名' + d.ranking + '<br />')
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
                .style('opacity', 1.0);
            }).on('mousemove', function (d) {
              tooltip.style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px');
            }).on('mouseout', function (d) {
              tooltip.style('opacity', 0.0);
            })
          });
        }
        // 创建文字
        function createText(dom) {
          var circleText = dom.append('g')
            .attr('class', 'circleText');

          circleText.append('path')
            .attr('id', 'curve')
            .attr('d', textOrbitPosition)
            .style('fill', 'none');
          circleText.append('text')
            .attr('id', 'curve-text-after')
            .style('font-size', textAfterEdgeSize)
            .attr('fill', textAfterEdgeColor)
            .attr('dx', textAfterEdgeDxDy[0])
            .attr('dy', textAfterEdgeDxDy[1])
            .append('textPath')
            .attr('xlink:href', '#curve')
            .attr('startOffset', textAfterEdgeStartOffset)
            .attr('dominant-baseline', textAfterEdgeDominantBaseline)
            .text(textAfterEdge);
          circleText.append('text')
            .attr('id', 'curve-text-before')
            .style('font-size', textBeforeEdgeSize)
            .style('fill', textBeforeEdgeColor)
            .attr('dx', textBeforeEdgeDxDy[0])
            .attr('dy', textBeforeEdgeDxDy[1])
            .append('textPath')
            .attr('xlink:href', '#curve')
            .attr('startOffset', textBeforeEdgeStartOffset)
            .attr('dominant-baseline', textBeforeEdgeDominantBaseline)
            .text(textBeforeEdge);
        }
        // 创建轨道
        function createOrbit(dom) {
          for (var i = 0; i < trackBall; i++) {
            dom.append("path")
              .attr("class", "earthOrbitPosition")
              .attr("d", d3.arc().outerRadius(radii.earthOrbit + orbitWidth / 2).innerRadius(radii.earthOrbit - orbitWidth / 2).startAngle(2 * Math.PI * i / trackBall).endAngle(2 * Math.PI * (i + 1) / trackBall))
              .style("fill", orbitColorScale(i));
          }
        }
        // 创建中心区域图
        function createRectArea(dom) {
          dom.append("circle")
            .attr("class", "sun")
            .attr("r", radii.sun)
            .style("fill", "nine");
        }
      });
    }

    // Getter/setter function
    circle.width = function (_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      return circle;
    };
    circle.height = function (_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      return circle;
    };
    circle.backgroundColor = function (_) {
      if (!arguments.length) {
        return backgroundColor;
      }
      backgroundColor = _;
      return circle;
    };
    circle.value = function (_) {
      if (!arguments.length) {
        return value;
      }
      value = _;
      return circle;
    };
    circle.orbitColor = function (_) {
      if (!arguments.length) {
        return orbitColor;
      }
      orbitColor = _;
      return circle;
    };
    circle.orbitWidth = function (_) {
      if (!arguments.length) {
        return orbitWidth;
      }
      orbitWidth = _;
      return circle;
    };
    circle.trackBall = function (_) {
      if (!arguments.length) {
        return trackBall;
      }
      trackBall = _;
      return circle;
    };
    circle.ballSize = function (_) {
      if (!arguments.length) {
        return ballSize;
      }
      ballSize = _;
      return circle;
    };
    circle.textAfterEdge = function (_) {
      if (!arguments.length) {
        return textAfterEdge;
      }
      textAfterEdge = _;
      return circle;
    };
    circle.textAfterEdgeColor = function (_) {
      if (!arguments.length) {
        return textAfterEdgeColor;
      }
      textAfterEdgeColor = _;
      return circle;
    };
    circle.textAfterEdgeSize = function (_) {
      if (!arguments.length) {
        return textAfterEdgeSize;
      }
      textAfterEdgeSize = _;
      return circle;
    };
    circle.textAfterEdgeStartOffset = function (_) {
      if (!arguments.length) {
        return textAfterEdgeStartOffset;
      }
      textAfterEdgeStartOffset = _;
      return circle;
    };
    circle.textAfterEdgeDxDy = function (_) {
      if (!arguments.length) {
        return textAfterEdgeDxDy;
      }
      textAfterEdgeDxDy = _;
      return circle;
    };
    circle.textAfterEdgeDominantBaseline = function (_) {
      if (!arguments.length) {
        return textAfterEdgeDominantBaseline;
      }
      textAfterEdgeDominantBaseline = _;
      return circle;
    };
    circle.textBeforeEdge = function (_) {
      if (!arguments.length) {
        return textBeforeEdge;
      }
      textBeforeEdge = _;
      return circle;
    };
    circle.textBeforeEdgeColor = function (_) {
      if (!arguments.length) {
        return textBeforeEdgeColor;
      }
      textBeforeEdgeColor = _;
      return circle;
    };
    circle.textBeforeEdgeSize = function (_) {
      if (!arguments.length) {
        return textBeforeEdgeSize;
      }
      textBeforeEdgeSize = _;
      return circle;
    };
    circle.textBeforeEdgeStartOffset = function (_) {
      if (!arguments.length) {
        return textBeforeEdgeStartOffset;
      }
      textBeforeEdgeStartOffset = _;
      return circle;
    };
    circle.textBeforeEdgeDxDy = function (_) {
      if (!arguments.length) {
        return textBeforeEdgeDxDy;
      }
      textBeforeEdgeDxDy = _;
      return circle;
    };
    circle.textBeforeEdgeDominantBaseline = function (_) {
      if (!arguments.length) {
        return textBeforeEdgeDominantBaseline;
      }
      textBeforeEdgeDominantBaseline = _;
      return circle;
    };

    return circle;
  }

  return d3.circle = circle;
}));
