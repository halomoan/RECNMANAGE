/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			var sNumber = "" + parseFloat(sValue).toFixed(2);
			return sNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		reminderIcon: function(done, daysLeft) {
			if (done) {
				return "sap-icon://status-completed";
			} else if (daysLeft >= 0) {
				return "sap-icon://status-critical";
			} else {
				return "sap-icon://status-error";
			}
		},

		reminderState: function(done, daysLeft) {
			if (done) {
				return sap.ui.core.ValueState.Success;
			} else if (daysLeft >= 0) {
				return sap.ui.core.ValueState.Warning;
			} else {
				return sap.ui.core.ValueState.Error;
			}
		},

		reminderLeftDayState: function(daysLeft) {
			if (daysLeft < 0) {
				return sap.ui.core.ValueState.Error;
			} else {
				return sap.ui.core.ValueState.Success;
			}
		},

		reminderLeftDay: function(daysLeft) {
			if (daysLeft < 0) {
				return daysLeft - 2 * daysLeft;
			} else {
				return daysLeft;
			}
		},

		reminderTitle: function(done, daysLeft) {
			if (done) {
				return "Reminder.StatusDone";
			} else if (daysLeft >= 0) {
				return "Reminder.DaysLeft";
			} else {
				return "Reminder.StatusOverdue";
			}
		},

		reminderDate: function(date) {
			return sap.ui.core.format.DateFormat.getDateInstance().format(date);
		}

	};

});