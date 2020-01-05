sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("fin.re.conmgmts1.controller.Home", {

		onInit: function() {
			
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		_onMetadataLoaded: function() {
		
			
		}
		

	});

});