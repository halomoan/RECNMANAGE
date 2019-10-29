/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
/**
 * Created by d065237 on 5/4/16.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Object"
], function($, Object) {
	"use strict";
	var Helper = Object.extend("fin.re.conmgmts1.util.SelectDataBindingHelper");
	Helper.initBlockWithTimeSlice = function(list, slice, tablePath, slicePath) {
		list.setTableBindingPath(tablePath);
		slice.attachChange(this.prototype._createOnSliceChangeFunction(list, slicePath, tablePath), this);
		var sliceTemplate = new sap.ui.core.Item({
			key: {
				parts: ["Dateto", "SAP__Origin"],
				formatter: function(dateTo, sapOrigin) {
					if (sapOrigin) {
						return dateTo.toISOString().slice(0, 19) + "__" + sapOrigin;
					} else {
						return dateTo.toISOString().slice(0, 19);
					}
				}
			},
			text: {
				parts: ["Datefrom", "Dateto"],
				formatter: function(dateFrom, dateTo) {
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance();
					return dateFormat.format(dateFrom) + " - " + dateFormat.format(dateTo);
				}
			}
		});
		slice.bindAggregation("items", {
			path: slicePath,
			template: sliceTemplate,
			events: {
				dataReceived: function(oEvent) {
					var data = oEvent.getParameter("data");
					if (data && data.results && data.results.length > 0) {
						var dateto;
						var sapOrigin;
						var i;
						for (i = 0; i < data.results.length; i++) {
							if (data.results[i].Current) {
								dateto = data.results[i].Dateto;
								if (data.results[i].SAP__Origin) {
									sapOrigin = data.results[i].SAP__Origin;
								}
								break;
							}
						}
						var dateString;
						if (dateto == undefined) {
							dateto = data.results[i - 1].Dateto;
							if (data.results[i - 1].SAP__Origin) {
								sapOrigin = data.results[i - 1].SAP__Origin;
							}
						}
						dateString = dateto.toISOString().slice(0, 19);
						var selectedKey = dateto.toISOString().slice(0, 19);
						if (sapOrigin) {
							selectedKey += "__" + sapOrigin;
						}
						slice.setSelectedKey(selectedKey);
						this.prototype._switchListBindingFromSlice(sapOrigin, dateString, list, slicePath, tablePath);
					}
					if (slice.getId().indexOf('mainPartnerSlice') === -1) {
						slice.addItem(new sap.ui.core.Item({
							key: "All",
							text: "{i18n>Common.AllTimeSlicesSection}"
						}));
					}
				}.bind(this)
			}
		});
	};
	Helper.prototype._createOnSliceChangeFunction = function(list, slicePath, tablePath) {
		return function(oEvent) {
			var selectedSlice = oEvent.getSource();
			var key = selectedSlice.getSelectedItem().getKey();
			var keySeparator = key.indexOf("__");
			var dateString;
			var sapOrigin;
			if (keySeparator > 0) {
				dateString = key.substring(0, keySeparator);
				sapOrigin = key.substring(keySeparator + 2);
			} else {
				dateString = key;
			}
			this.prototype._switchListBindingFromSlice(sapOrigin, dateString, list, slicePath, tablePath);
		};
	};
	Helper.prototype._switchListBindingFromSlice = function(sapOrigin, dateString, list, slicePath, tablePath) {
		var newListBindingPath;
		if (dateString === "All") {
			newListBindingPath = tablePath;
		} else {
			var key = "(";
			if (sapOrigin) {
				key += "SAP__Origin='" + sapOrigin + "',";
			}
			key += "Dateto=datetime'" + dateString + "')/";
			newListBindingPath = slicePath + key + tablePath;
		}
		list.setTableBindingPath(newListBindingPath);
		list.rebindTable(true);

	};

	Helper.prototype._createBindingPath = function(entity, key, value) {
		return entity + "(" + key + "='" + value + "')";
	};

	return Helper;
});
