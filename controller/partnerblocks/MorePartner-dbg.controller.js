/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global location*/
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"fin/re/conmgmts1/model/formatter",
	"fin/re/conmgmts1/util/SelectDataBindingHelper"
], function(BaseController, JSONModel, History, formatter, SelectDataBindingHelper) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.partnerblocks.MorePartner", {
		formatter: formatter,

		onInit: function() {

		},


		onAfterRendering: function() {
			this._bindMorePartnerSection();

		},

		_bindMorePartnerSection: function() {
			var sView = this.getView();
			var partnerListSlice = sView.byId("partnerListSlice");
			var partnerList = sView.byId("partnerList");
			SelectDataBindingHelper.initBlockWithTimeSlice(partnerList, partnerListSlice, "Partner", "PartnerSlice");
		}
	});
});
