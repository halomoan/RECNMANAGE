/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/thirdparty/d3',
	"sap/ui/core/ResizeHandler",
	"sap/ui/model/json/JSONModel"
], function($, Control, d3, ResizeHandler, JSONModel) {
	'use strict';

	return Control.extend('fin.re.conmgmts1.controls.timeline.TimeLine', {
		metadata: {
			properties: {
				from: {
					type: 'object',
					bindable: true
				},
				to: {
					type: 'object',
					bindable: true
				},
				currentTimeline: {
					type: 'object',
					bindable: true
				},
				next: {
					type: 'boolean',
					bindable: true
				}
			},
			aggregations: {
				items: {
					type: 'fin.re.conmgmts1.controls.timeline.TimeLineItem',
					multiple: true,
					singularName: 'item',
					bindable: true
				}
			},
			defaultAggregation: 'items',
			events: {
				press: {
					enableEventBubbling: true
				}
			}
		},

		_sResizeHandlerId: null,

		init: function() {

		},

		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass('timeline-chart-container');
			oRm.writeClasses();
			oRm.write('>');
			oRm.write("</div>");
		},

		openPopOver: function(source, event) {
			if (!this._reminderPopover) {
				this._reminderPopover = sap.ui.xmlfragment('fin.re.conmgmts1.view.contractstermblocks.TimelinePopover', this);
				this.addDependent(this._reminderPopover);
			}
			this._reminderPopover.setModel(new JSONModel({
				date: event.dateTo,
				info: event.eventInfo
			}), 'selectedTimelineEvent');
			this._reminderPopover.openBy(source);
		},

		_mapEventsColor: function(events, type) {
			var colorValue = '#000';
			switch (type) {
				case 'L':
					colorValue = '#fac364';
					break;
				case 'M':
					colorValue = '#d998cb';
					break;
				case 'V':
					colorValue = '#5cbae6';
					break;
				case 'W':
					colorValue = '#b6d957';
					break;
				case 'R':
					colorValue = '#5cbae6';
					break;
				case 'K':
					colorValue = '#d998cb';
					break;
				default:
					colorValue = '#000';
			}
			events.map(function(e) {
				if (e.eventType === 'R' && e.dateFrom.getTime() < new Date().getTime()) {
					e.color = "#888888";
				} else {
					e.color = colorValue;
				}

			});
			return events;
		},

		_mapEventsIcon: function(events, type) {
			var iconValue = '\ue220';
			switch (type) {
				case 'L':
					iconValue = '\ue22a';
					break;
				case 'M':
					iconValue = '\ue22a';
					break;
				case 'V':
					iconValue = '\ue053';
					break;
				case 'W':
					iconValue = '\ue0a7';
					break;
				case 'R':
					iconValue = '\ue030';
					break;
				case 'K':
					iconValue = '\ue22a';
					break;
				default:
					iconValue = '\ue220';
			}
			events.map(function(d) {
				d.icon = iconValue;
			});
			return events;
		},

		_getDaysDiff: function(eventA, eventB) {
			// 86400000 = 1000 * 60 * 60 * 24
			var dateToMonthNumber = parseInt(eventA.dateTo.getTime() / 86400000, 0);
			var dateFromMonthNumber = parseInt(eventB.dateFrom.getTime() / 86400000, 0);
			return dateToMonthNumber - dateFromMonthNumber;
		},

		_addHeightByCount: function(eventsRow, height) {
			var result = height;
			if (eventsRow === 1) {
				result = result + 35;
			} else if (eventsRow === 0) {
				result = result;
			} else {
				result = result + (eventsRow - 1) * 15 + 35;
			}
			return result;
		},

		_getLengthDiff: function(eventA, eventB) {
			var longA = parseInt((eventA.dateTo.getTime() - eventA.dateFrom.getTime()) / 86400000, 0);
			var longB = parseInt((eventB.dateTo.getTime() - eventB.dateFrom.getTime()) / 86400000, 0);
			return longA - longB;
		},

		_setY: function(events, startY) {
			var count = 0;
			var currentCount = 0;
			var baseEvent;
			if (events.length > 0) {
				baseEvent = events[0];
				count = count + 1;
				events[0].y = startY;
				currentCount = 1;
			}
			var yValue = startY;
			for (var i = 1; i < events.length; i++) {
				var daysDiff = this._getDaysDiff(baseEvent, events[i]);
				if (daysDiff < -45) {
					yValue = startY;
					baseEvent = events[i];
					if (currentCount > count) {
						count = currentCount;
					}
					currentCount = 1;
				} else {
					yValue = yValue + 15;
					currentCount = currentCount + 1;
					if (this._getLengthDiff(baseEvent, events[i]) < -5) {
						baseEvent = events[i];
					}
				}
				events[i].y = yValue;
			}
			if (currentCount > count) {
				count = currentCount;
			}
			return {
				count: count,
				events: events
			};
		},

		_getSortedEventsByType: function(events, type) {
			var filteredEvents = events.filter(function(d) {
				return d.eventType === type;
			});
			var sortedEvents = filteredEvents.sort(function(a, b) {
				if (type === 'W' || type === 'V') {
					return b.dateFrom.getTime() - a.dateFrom.getTime();
				} else {
					return a.dateFrom.getTime() - b.dateFrom.getTime();
				}
			});
			sortedEvents = this._mapEventsColor(sortedEvents, type);
			sortedEvents = this._mapEventsIcon(sortedEvents, type);
			if (type === 'V' || type === 'W') {
				sortedEvents = filteredEvents.filter(function(d) {
					// 86400000 = 1000 * 60 * 60 * 24
					var daysOfEvent = parseInt(d.dateFrom.getTime() / 86400000, 0);
					var daysOfCurrent = parseInt(new Date().getTime() / 86400000, 0);
					return daysOfEvent >= daysOfCurrent;
				});
			}
			if (this.getNext() && sortedEvents.length > 0 && type != 'R') {
				sortedEvents =
					(type === 'V' || type === 'W') ? [sortedEvents[sortedEvents.length - 1]] : [sortedEvents[0]];
			}
			return sortedEvents;
		},

		_breakDateText: function(dateText, separator) {
			return dateText.split(separator);
		},

		_drawReminders: function(svg, events, x, y) {
			var that = this;
			var reminders = svg.append("g");
			reminders.selectAll(".reminder")
				.data(events)
				.enter().append("text")
				.attr("class", "reminder")
				.attr("x", function(d) {
					return x(d.dateFrom);
				})
				.attr("y", y)
				.on("click", function(d) {
					that.openPopOver(this, d);
				})
				.style("display", "none")
				.attr("dy", ".35em")
				.attr("dx", "-.80em")
				.style("font-family", "SAP-icons")
				.style("fill", function(d) {
					return d.color;
				})
				.text(function(d) {
					return d.icon;
				});
		},

		_drawEvent: function(svg, events, x, width) {
			// draw line
			var lines = svg.append("g");
			lines.selectAll(".itemline")
				.data(events)
				.enter().append("line")
				.attr("class", "itemline")
				.attr("y1", function(d) {
					return d.y;
				})
				.attr("y2", function(d) {
					return d.y;
				})
				.attr("x1", function(d) {
					if (x(d.dateFrom) < 0) {
						return 0;
					} else if (x(d.dateFrom) > (width - 264)) {
						return (width - 264);
					} else {
						return x(d.dateFrom);
					}
				})
				.attr("x2", function(d) {
					return x(d.dateTo) > (width - 264) ? (width - 264) : x(d.dateTo);
				})
				.style("fill", "none")
				.style("stroke", function(d) {
					return d.color;
				})
				.style("stroke-width", "3")
				.style("shape-rendering", "crispEdges");

			// draw end dot of line
			lines.selectAll(".enddot")
				.data(events)
				.enter().append("line")
				.attr("class", "enddot")
				.attr("y1", function(d) {
					return d.y - 5;
				})
				.attr("y2", function(d) {
					return d.y + 5;
				})
				.attr("x1", function(d) {
					return x(d.dateTo);
				})
				.attr("x2", function(d) {
					return x(d.dateTo);
				})
				.style("display", function(d) {
					return x(d.dateTo) > (width - 264) ? "none" : "";
				})
				.style("stroke-width", "3")
				.style("shape-rendering", "crispEdges")
				.style("stroke", function(d) {
					return d.color;
				});

			if ((events.length > 0) && (events[0].eventType === "V" || events[0].eventType === "W")) {
				// draw end dot of line
				lines.selectAll(".dotline")
					.data(events)
					.enter().append("line")
					.attr("class", "dotline")
					.attr("y1", function(d) {
						return d.y;
					})
					.attr("y2", function(d) {
						return d.y;
					})
					.attr("x1", function(d) {
						return x(d.notifDateTo);
					})
					.attr("x2", function(d) {
						return x(d.dateFrom);
					})
					.style("stroke-dasharray", "3,5")
					.style("stroke-width", "3")
					.style("shape-rendering", "crispEdges")
					.style("stroke", function(d) {
						return d.color;
					});
			}

			// draw start icon of line
			lines.selectAll(".starticon")
				.data(events)
				.enter().append("text")
				.attr("class", "starticon")
				.attr("x", function(d) {
					return d.notifDateTo === undefined ? x(d.dateFrom) : x(d.notifDateTo);
				})
				.attr("y", function(d) {
					return d.y;
				})
				.attr("dy", ".35em")
				.attr("dx", "-.80em")
				.style("font-family", "SAP-icons")
				.style("fill", function(d) {
					return d.color;
				})
				.text(function(d) {
					return d.icon;
				});
		},



		resize: function() {
			var oBundle = this.getModel("i18n").getResourceBundle();
			var today = oBundle.getText("Terms.Timeline.Label.Today");
			var showReminders = oBundle.getText("Terms.Timeline.Label.ShowReminders");
			var that = this;
			var customTimeFormat = d3.time.format.multi([
				["%b", function(d) {
					return d.getMonth();
				}],
				["%b:%Y", function() {
					return true;
				}]
			]);
			//var $container = $('.timeline-chart-container');
			var width = parseInt(d3.select(".timeline-chart-container").style("width"), 10);
			var timeTicksRange = width > 800 ? 3 : 12;
			var height = parseInt(d3.select(".timeline-chart-container").style("height"), 10);
			var cItems = this.getItems();
			var mockUpItems = [];
			for (var i = 0; i < cItems.length; i++) {
				mockUpItems.push({
					"dateFrom": cItems[i].getProperty("dateFrom"),
					"dateTo": cItems[i].getProperty("dateTo"),
					"eventType": cItems[i].getProperty("eventType"),
					"eventLevel": cItems[i].getProperty("eventLevel"),
					"eventInfo": cItems[i].getProperty("eventInfo"),
					"notifDateTo": cItems[i].getProperty("notifDateTo")
				});
			}
			var current = this.getCurrentTimeline();
			height = 75;
			if (!(current instanceof Array)) {
				var eventsAndCount = this._setY(this._getSortedEventsByType(mockUpItems, "V"), height);
				var optionalRenewals = eventsAndCount.events;
				height = this._addHeightByCount(eventsAndCount.count, height);
				eventsAndCount = this._setY(this._getSortedEventsByType(mockUpItems, "W"), height);
				var automaticRenewals = eventsAndCount.events;
				height = this._addHeightByCount(eventsAndCount.count, height);
				eventsAndCount = this._setY(this._getSortedEventsByType(mockUpItems, "L"), height);
				var contracteeBreakOptions = eventsAndCount.events;
				height = this._addHeightByCount(eventsAndCount.count, height);
				eventsAndCount = this._setY(this._getSortedEventsByType(mockUpItems, "M"), height);
				var contractorBreakOptions = eventsAndCount.events;
				height = this._addHeightByCount(eventsAndCount.count, height);
				eventsAndCount = this._setY(this._getSortedEventsByType(mockUpItems, "K"), height);
				var breakOptions = eventsAndCount.events;
				height = this._addHeightByCount(eventsAndCount.count, height);
				var reminders = this._getSortedEventsByType(mockUpItems, "R", -0.3);
				var from = this.getFrom();
				var to = this.getTo();
				var id = this.getId();
				var x = d3.time.scale().domain([from, to]).range([0, width - 264]);
				var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(6, 0).tickFormat(customTimeFormat).ticks(d3.time.months,
					timeTicksRange);
				var svg = d3.select("svg").remove();
				svg = d3.select("#" + id)
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.append("g")
					//.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
					.style("font", "11px sans-serif");

				svg.append("g")
					.attr("transform", "translate(0," + 40 + ")")
					.attr("class", "x axis")
					.call(xAxis);

				// draw current time period
				current.color = '#000';
				var currentPeriod = svg.append("g");
				currentPeriod.append("line")
					.attr("y1", 40)
					.attr("y2", 40)
					.attr("x1", function() {
						return x(current.dateFrom);
					})
					.attr("x2", function() {
						return x(current.dateTo) > (width - 264) ? (width - 264) : x(current.dateTo);
					})
					.style("fill", "none")
					.style("stroke", "#000")
					.style("stroke", "#000")
					.style("stroke-width", "3")
					.style("shape-rendering", "crispEdges");
				currentPeriod.append("circle")
					.attr("cx", function() {
						return x(current.dateFrom);
					})
					.attr("cy", 40)
					.attr("r", 4)
					.style("fill", "#000");
				if (x(current.dateTo) <= (width - 264)) {
					currentPeriod.append("line")
						.attr("y1", 35)
						.attr("y2", 45)
						.attr("x1", x(current.dateTo))
						.attr("x2", x(current.dateTo))
						.style("stroke-width", "3")
						.style("stroke", "#000");
				}


				//var colorDef = [contracteeBreakOptions[0], contractorBreakOptions[0], renewals[0]];
				var colorDef = [];
				if (current) {
					colorDef.push(current);
				}
				if (optionalRenewals.length > 0) {
					colorDef.push(optionalRenewals[0]);
				}
				if (automaticRenewals.length > 0) {
					colorDef.push(automaticRenewals[0]);
				}
				if (contracteeBreakOptions.length > 0) {
					colorDef.push(contracteeBreakOptions[0]);
				}
				if (contractorBreakOptions.length > 0) {
					colorDef.push(contractorBreakOptions[0]);
				}
				if (breakOptions.length > 0) {
					colorDef.push(breakOptions[0]);
				}


				// draw legend
				var legend = svg.selectAll(".legend")
					.data(colorDef)
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) {
						return "translate(0," + (i + 2) * 18 + ")";
					});

				legend.append("line")
					.attr("y1", 6)
					.attr("y2", 6)
					.attr("x1", width - 214)
					.attr("x2", width - 190)
					.style("stroke", function(d) {
						return d.color;
					})
					.style("stroke-width", "3");

				legend.append("text")
					.attr("x", width - 184)
					.attr("y", 6)
					.attr("dy", ".35em")
					.style("text-anchor", "start")
					.text(function(d) {
						return d.eventInfo;
					});

				// draw events and reminders
				this._drawEvent(svg, optionalRenewals, x, width);
				this._drawEvent(svg, automaticRenewals, x, width);
				this._drawEvent(svg, contracteeBreakOptions, x, width);
				this._drawEvent(svg, contractorBreakOptions, x, width);
				this._drawEvent(svg, breakOptions, x, width);
				this._drawReminders(svg, reminders, x, 55);


				// draw start today line
				svg.append("g").append("line")
					.attr("y1", 15)
					.attr("y2", height)
					.attr("x1", x(new Date()))
					.attr("x2", x(new Date()))
					.style("stroke", "#000")
					.style("stroke-width", "1")
					.style("stroke-dasharray", "5");
				svg.append("text")
					.attr("x", x(new Date()))
					.attr("y", 1)
					.attr("dy", ".70em")
					.attr("dx", "1.1em")
					.style("text-anchor", "end")
					.text(today);

				d3.selectAll("g.tick line").each(function(d) {
					d3.select(this)
						.attr("y1", height)
						.attr("y2", "-5");
				});

				d3.selectAll("g.tick text").each(function(d) {
					var dateTexts = that._breakDateText(d3.select(this).text(), ":");
					d3.select(this).text('');
					d3.select(this).append('tspan')
						.attr('y', '0')
						.attr('dy', '-0.5em')
						.text(dateTexts[0]);
					d3.select(this).append('tspan')
						.attr('y', '0')
						.attr('dx', '-1.5em')
						.attr('dy', '1.2em')
						.text(dateTexts[1]);

				});

				// checkbox
				svg.append("foreignObject")
					.attr("width", 200)
					.attr("height", 200)
					.attr("x", width - 214)
					.attr("y", 0)
					.append("xhtml:body")
					.html("<form><input type=checkbox id=check>" + showReminders + "</input></form>")
					.on("click", function(d, i) {
						if (svg.select("#check").node().checked) {
							svg.selectAll(".reminder").style("display", "");
						} else {
							svg.selectAll(".reminder").style("display", "none");
						}
					});

			}
		},

		onAfterRendering: function() {
			this.resize();
			this._sResizeHandlerId = ResizeHandler.register(this, $.proxy(this.resize, this));
		}

	});

}, true);
