/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	"fin/re/conmgmts1/model/formatter"
], function(BaseController, formatter) {
	'use strict';

	return BaseController.extend('fin.re.conmgmts1.controller.reminderblocks.ReminderPopoverList', {
		formatter: formatter,
		onInit: function() {
			this._showCompletedReminders = false;
		},

		onAfterRendering: function() {
			this._rebindTable();
		},

		_rebindTable: function() {
			var viewId = this.getView().getId();
			var reminderList = sap.ui.getCore().byId(viewId + "--" + "reminderListPopover");

			var filters;
			if (this._showCompletedReminders) {
				filters = [];
			} else {
				filters = [new sap.ui.model.Filter("Rsdone", sap.ui.model.FilterOperator.EQ, "false")];
			}
			var oBinding = reminderList.getBinding("items");
			oBinding.filter(filters);

		},

		formatterForTranslatedReminderTitle: function(done, daysLeft) {
			var title = formatter.reminderTitle(done, daysLeft);
			return this.getModel("i18n").getResourceBundle().getText(title);
		},

		onDoneButtonPressed: function(event) {
			event.preventDefault();
			var id = event.getSource().getId();
			sap.ui.getCore().byId(id.replace("doneButton", "commentDisplayArea")).setVisible(false);
			var editArea = sap.ui.getCore().byId(id.replace("doneButton", "editArea"));
			editArea.setVisible(true);
		},

		enableDoneButton: function(done) {
			return !done;
		},

		onSaveButtonPressed: function(event) {
			//event.preventDefault();
			//event.getSource().getBindingContext().getObject.Rsdone = true;//('Rsdone', true);
			var that = this;
			var sPath = event.getSource().getBindingContext().sPath;
			var oData = event.getSource().getBindingContext().getObject();
			oData.Rsdone = true;
			this.getView().getModel().update(sPath, oData, {
				merge: false,
				success: function() {
					that.getView().getModel().resetChanges();
				}
			});
			var id = event.getSource().getId();
			var editArea = sap.ui.getCore().byId(id.replace("saveButton", "editArea"));
			editArea.setVisible(false);
			var commentDisplayArea = sap.ui.getCore().byId(id.replace("saveButton", "commentDisplayArea"));
			commentDisplayArea.setVisible(true);
			var doneButton = sap.ui.getCore().byId(id.replace("saveButton", "doneButton"));
			doneButton.setVisible(false);

		},

		onCancelButtonPressed: function(event) {
			this.getView().getModel().resetChanges();
			var id = event.getSource().getId();
			var editArea = sap.ui.getCore().byId(id.replace("cancelButton", "editArea"));
			editArea.setVisible(false);
			var doneButton = sap.ui.getCore().byId(id.replace("cancelButton", "commentDisplayArea"));
			doneButton.setVisible(true);

		},

		onReminderFilterSelection: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			if (key === "all") {
				this._showCompletedReminders = true;
			} else {
				this._showCompletedReminders = false;
			}
			this._rebindTable();

		}
	});
});
