/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController"
], function(BaseController) {
	'use strict';

	return BaseController.extend('fin.re.conmgmts1.controller.reminderblocks.ReminderList', {
		onInit: function() {
			this._showCompletedReminders = false;
		},

		onAfterRendering: function() {
			var viewId = this.getView().getId();
			var reminderList = sap.ui.getCore().byId(viewId + "--" + "reminderList");
			reminderList.attachBeforeRebindTable(this._onBeforeReminderRendering.bind(this));
			var reminderToggle = sap.ui.getCore().byId(viewId + "--" + "reminderToggle");
			reminderToggle.attachPress(this._onReminderTogglePress.bind(this));

			if (sap.ui.Device.browser.name === "ff") {
				this._initTable4FF();
			}
		},

		_onBeforeReminderRendering: function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (!this._showCompletedReminders) {
				var rsdoneFilter = new sap.ui.model.Filter("Rsdone", sap.ui.model.FilterOperator.EQ, "false");
				mBindingParams.filters = [rsdoneFilter];
			}
		},

		_onReminderTogglePress: function(oEvent) {
			this._showCompletedReminders = oEvent.getSource().getPressed();
			var viewId = this.getView().getId();
			var reminderList = sap.ui.getCore().byId(viewId + "--" + "reminderList");
			reminderList.rebindTable();
		},

		/* see Contract.controller.js */
		_initTable4FF: function() {
			var viewId = this.getView().getId();
			var reminderList = sap.ui.getCore().byId(viewId + "--" + "reminderList");
			reminderList.rebindTable();
		}
	});
});
