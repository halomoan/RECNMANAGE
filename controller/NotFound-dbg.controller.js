/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.NotFound", {

		/**
		 * Navigates to the worklist when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			this.getRouter().navTo("worklist");
		}

	});

});
