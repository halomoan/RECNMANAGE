/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"fin/re/conmgmts1/model/formatter"
], function(BaseController,JSONModel, formatter) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel = new JSONModel({
				Bukrs : "1001",
				Swenr : "00001001",
				RecnType : "L001"
			});
			this.setModel(oViewModel, "viewModel");
		},

		onAfterRendering: function() {
			var view = this.getView();
			/*var model = view.getModel();
			model.attachRequestCompleted(function() {
				/*var metaModel = model.getMetaModel();
				var entity = metaModel.getODataEntitySet("ContractDataSet");
				
				if (entity.hasOwnProperty("sap:searchable") && entity["sap:searchable"] === "true") {
				
					view.byId("smartFilterBarWithBasicSearch").setVisible(true);
					view.byId("contractsWithBasicSearch").setVisible(true);
					view.byId("smartFilterBarWithoutBasicSearch").setVisible(false);
					view.byId("contractsWithoutBasicSearch").setVisible(false);
				} else {
					view.byId("smartFilterBarWithBasicSearch").setVisible(false);
					view.byId("contractsWithBasicSearch").setVisible(false);
					view.byId("smartFilterBarWithoutBasicSearch").setVisible(true);
					view.byId("contractsWithoutBasicSearch").setVisible(true);
				}*/
				
			/*	var smartFilterBar = view.byId("smartFilterBarWithoutBasicSearch"); 
				var oRecnType = smartFilterBar.getControlByKey("
					Recntype");
				oRecnType.setValue("L001");
			});*/
			 var oSmartFilter = view.byId("smartFilterBarWithoutBasicSearch");
			 oSmartFilter.attachInitialized(this.onInitSmartFilter, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		onInitSmartFilter: function(oEvent) {
			var oView = this.getView();
			var oSmartFilter = oView.byId("smartFilterBarWithoutBasicSearch");
			
			// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 		pattern: "MMM d, y"
			// });
			
			//var oTodaysDate = new Date();
			// var oJSONData = {
			// 	"Swenr" :   "0001001"
			// };
			// oSmartFilter.setFilterData(oJSONData);
			
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showContract(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showContract: function(oItem) {
			var routingObject = this._parseRoutingFromItem(oItem);
			this.getRouter().navTo(this._parseNavTarget(routingObject), routingObject);
		},

		_parseNavTarget: function(routingObject) {
			if (routingObject.hasOwnProperty("systemId")) {
				return "systemContract";
			} else {
				return "contract";
			}
		},

		_parseRoutingFromItem: function(oItem) {
			var result = {};

			var path = oItem.getBindingContext().getPath();
			var keyStart = path.indexOf("(");
			var keyEnd = path.lastIndexOf(")");
			var key = path.substring(keyStart + 1, keyEnd);
			var keyParts = key.split(",");

			keyParts.forEach(function(keyPart) {
				var parsedKeyPart = this._parseKeyPart(keyPart.trim());
				result[parsedKeyPart.key] = parsedKeyPart.value;
			}, this);


			return result;
		},

		_parseKeyPart: function(keyPart) {
			var keyEnd = keyPart.indexOf("=");

			var value = keyPart.substring(keyEnd + 2, keyPart.length - 1);

			var rawKey = keyPart.substring(0, keyEnd);
			var key;
			
			if (rawKey === "SAP__Origin") {
				key = "systemId";
			} else if (rawKey === "Bukrs") {
				key = "companyCode";
			} else if (rawKey === "Swenr") {
				key = "busEntity";
			} else if (rawKey === "Recnnr") {
				key = "contractId";
			} else {
				return {};
			}

			return {
				key: key,
				value: value
			};
		}

	});
});