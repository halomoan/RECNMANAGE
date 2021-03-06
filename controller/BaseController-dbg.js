/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	jQuery.sap.require("jquery.sap.storage");
	
	return Controller.extend("fin.re.conmgmts1.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		setParams:  function(oParams){
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			oStorage.put("localParams", oParams);
		},
		getParams:  function(){
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			if(oStorage.get("localParams")) {
				return oStorage.get("localParams");
			} else {
				return {};
			}
		},
		getMainBPRole : function() {
			return "BPR101";
		},
		getOtherBPRole : function(){
			return "BPL002";
		}

	});

});